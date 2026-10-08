// Camada de dados compartilhada entre o site (index.html) e a gestão (gestao.html).
// Usa o Supabase quando config.js está preenchido; senão, fica desligada (PN.on === false).
window.PN = (() => {
  const cfg = window.PULA_CONFIG || {};
  const on = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient);
  const sb = on ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  const fromRow = r => ({
    id: r.id, data: r.data, horario: r.horario || "", cliente: r.cliente, telefone: r.telefone,
    endereco: r.endereco || "", cidade: r.cidade || "", aniversariante: r.aniversariante || "",
    itens: r.itens || [], valorBrinquedos: Number(r.valor_brinquedos) || 0, frete: Number(r.frete) || 0,
    freteCombinar: !!r.frete_combinar, total: Number(r.total) || 0, pagamentos: r.pagamentos || [],
    status: r.status, pagamentoInformado: !!r.pagamento_informado, origem: r.origem || "gestao",
    obs: r.obs || "", criadoEm: (r.criado_em || "").slice(0, 10)
  });
  const toRow = r => ({
    id: r.id, data: r.data, horario: r.horario, cliente: r.cliente, telefone: r.telefone,
    endereco: r.endereco, cidade: r.cidade, aniversariante: r.aniversariante || "",
    itens: r.itens, valor_brinquedos: r.valorBrinquedos || 0, frete: r.frete || 0,
    frete_combinar: !!r.freteCombinar, total: r.total, pagamentos: r.pagamentos || [],
    status: r.status, pagamento_informado: !!r.pagamentoInformado, origem: r.origem || "gestao", obs: r.obs || ""
  });
  const erro = e => {
    const msg = (e && (e.message || e.details || "")) + "";
    const err = new Error(msg.includes("BRINQUEDO_OCUPADO") ? "ocupado" : msg || "falha");
    err.code = msg.includes("BRINQUEDO_OCUPADO") ? "ocupado" : "falha";
    return err;
  };

  return {
    on,
    // ---- usado pelo site (visitante, sem login) ----
    async ocupacao(de, ate) {
      const { data, error } = await sb.rpc("ocupacao", { de, ate });
      if (error) throw erro(error);
      return data || [];
    },
    async criarReservaSite(r) {
      const { error } = await sb.from("reservas").insert(toRow({ ...r, origem: "site", status: "reservado", pagamentos: [], pagamentoInformado: false }));
      if (error) throw erro(error);
    },
    async informarPagamento(id) {
      const { error } = await sb.rpc("informar_pagamento", { reserva_id: id });
      if (error) throw erro(error);
    },
    // ---- usado pela gestão (dona, com login) ----
    async sessao() { const { data } = await sb.auth.getSession(); return data.session; },
    async entrar(email, senha) {
      const { error } = await sb.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
    },
    async sair() { await sb.auth.signOut(); },
    async listar() {
      const { data, error } = await sb.from("reservas").select("*").order("data");
      if (error) throw erro(error);
      return (data || []).map(fromRow);
    },
    async salvar(r) {
      const { error } = await sb.from("reservas").upsert(toRow(r));
      if (error) throw erro(error);
    },
    async salvarVarias(lista) {
      if (!lista.length) return;
      const { error } = await sb.from("reservas").upsert(lista.map(toRow));
      if (error) throw erro(error);
    }
  };
})();
