
import { useState } from 'react';
import logo from '../assets/Logo.jpeg';
import { supabase } from '../lib/supabase';

// ── Format Rupiah ─────────────────────────────────────────
const fmt = (n) =>
  'Rp. ' + Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2 });

// ── Data awal ─────────────────────────────────────────────
const DEFAULT_COMPANY = {
  name: 'PT. Putri Jagad Raya\nJaya Abadi',
  alamat: '123 Anywhere St., Any City, ST 12345',
  telp: '+123-456-7890',
  mail: 'hello@putrijagad.com',
  web: 'www.putrijagad.com',
};
const DEFAULT_CLIENT = {
  name: 'Sacha Dubois',
  address: '123 Anywhere St., Any City,\nST 12345',
  telp: '+123-456-7890',
  mail: 'hello@reallygreatsite.com',
  web: 'www.reallygreatsite.com',
};
const DEFAULT_INVOICE = {
  noFaktur: 'inv-1234567890',
  tanggal: '2026-12-12',
  jatuhTempo: '2026-12-17',
};
const DEFAULT_PAYMENT = {
  note: 'Silahkan transfer ke rekening',
  atasNama: 'PT. Putri Jagad Raya Jaya Abadi',
  namaBank: 'Bank Kota Borcelle',
  noRek: '#123/456/7890',
};
const DEFAULT_ROWS = [
  { id: 1, desc: 'Barang A', qty: 1, harga: 15000000 },
  { id: 2, desc: 'Barang B', qty: 1, harga: 1000000 },
  { id: 3, desc: 'Barang C', qty: 5, harga: 1000000 },
];
const DEFAULT_FOOTER = {
  syarat: 'Terima kasih telah menggunakan layanan kami.\nHarap simpan invoice ini sebagai bukti transaksi.',
  signerLeft: 'Direktur Utama',   // kolom kiri: Hormat Kami
  signerRight: 'Penerima',        // kolom kanan: Penerima
};

// ── Inline styles (landscape + sidebar) ─────────────────
const S = {
  /* layout utama: sidebar kiri + area faktur */
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0ede8',
    fontFamily: "'Georgia', serif",
  },

  /* SIDEBAR — disembunyikan saat print */
  sidebar: {
    width: 72,
    flexShrink: 0,
    background: '#2c2c2c',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    gap: 12,
    position: 'sticky',
    top: 0,
    height: '100vh',
    // disembunyikan via @media print di <style> global atau index.css
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    background: '#3d3d3d',
    color: '#fff',
    transition: 'background 0.15s',
  },
  sideBtnLabel: {
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.3,
    color: '#aaa',
  },
  sideBtnPrint: {
    background: '#7c5cbf',
  },

  /* area scroll faktur */
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  /* kertas A4 landscape: 297mm × 210mm → px (96dpi ≈ 1122 × 794) */
  invoice: {
    width: 1122,
    minHeight: 794,
    background: '#fff',
    boxShadow: '0 4px 40px rgba(0,0,0,0.18)',
    padding: '36px 48px',
    boxSizing: 'border-box',
    position: 'relative',
    color: '#1a1a1a',
  },

  /* header */
  invHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #5a3e8a',
    paddingBottom: 16,
    marginBottom: 20,
  },
  invoiceLabel: {
    position: 'absolute',
    top: 36,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 6,
    color: '#888',
    textTransform: 'uppercase',
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: 12 },
  logoImg: { width: 52, height: 52, objectFit: 'contain', borderRadius: 6 },
  companyName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#3d1f6e',
    whiteSpace: 'pre-line',
    lineHeight: 1.3,
  },

  /* info grid kanan */
  companyInfo: {
    display: 'grid',
    gridTemplateColumns: '56px 1fr',
    gap: '3px 8px',
    alignItems: 'center',
    fontSize: 11,
    color: '#555',
  },
  lbl: { fontWeight: 600, color: '#7c5cbf', fontSize: 10, textTransform: 'uppercase' },

  /* meta section (billing + faktur info) */
  invMeta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 20,
  },
  boxBorder: {
    border: '1px solid #e0d6f0',
    borderRadius: 8,
    padding: '12px 14px',
    background: '#faf8fd',
  },
  accentLeft: { borderLeft: '4px solid #7c5cbf' },
  metaLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#7c5cbf',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  metaRow: {
    display: 'grid',
    gridTemplateColumns: '90px 1fr',
    alignItems: 'center',
    gap: '4px 8px',
    marginBottom: 4,
  },
  paymentTitle: {
    fontWeight: 700,
    fontSize: 11,
    color: '#3d1f6e',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* input field — no underline, hanya highlight saat hover/focus */
  field: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 12,
    color: '#1a1a1a',
    width: '100%',
    padding: '2px 4px',
    borderRadius: 3,
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },

  /* tabel */
  invTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
    marginBottom: 8,
  },
  th: {
    background: '#3d1f6e',
    color: '#fff',
    padding: '7px 10px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  td: {
    padding: '5px 10px',
    borderBottom: '1px solid #ede8f5',
    verticalAlign: 'middle',
  },
  tdCenter: { textAlign: 'center' },
  tdRight: { textAlign: 'right' },

  addRowBtn: {
    fontSize: 11,
    color: '#7c5cbf',
    background: 'none',
    border: '1px dashed #7c5cbf',
    borderRadius: 5,
    padding: '3px 12px',
    cursor: 'pointer',
    marginBottom: 16,
  },
  delRow: {
    background: 'none',
    border: 'none',
    color: '#c0392b',
    cursor: 'pointer',
    fontSize: 13,
    padding: 0,
  },

  /* footer */
  invFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 24,
    borderTop: '2px solid #5a3e8a',
    paddingTop: 16,
    marginTop: 4,
  },

  /* dua tanda tangan */
  signaturesRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  signatureBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sigCaption: { fontSize: 11, color: '#888', marginBottom: 40 },
  sigLine: {
    width: '80%',
    borderBottom: '1.5px solid #3d1f6e',
    marginBottom: 4,
  },

  /* totals */
  totals: { display: 'flex', flexDirection: 'column', gap: 5 },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    padding: '3px 0',
    borderBottom: '1px solid #ede8f5',
  },
  totalRowGrand: {
    fontWeight: 700,
    fontSize: 14,
    color: '#3d1f6e',
    borderBottom: '2px solid #3d1f6e',
    padding: '5px 0',
  },

  /* harga wrap */
  hargaWrap: { display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  rpLabel: { fontSize: 11, color: '#888' },
};

// ── Komponen utama ────────────────────────────────────────
export default function Invoice() {
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [client, setClient] = useState(DEFAULT_CLIENT);
  const [invInfo, setInvInfo] = useState(DEFAULT_INVOICE);
  const [payment, setPayment] = useState(DEFAULT_PAYMENT);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [pajakPct, setPajakPct] = useState(11);
  const [diskonPct, setDiskonPct] = useState(0);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [nextId, setNextId] = useState(6);

  // Kalkulasi
  const subTotal = rows.reduce((s, r) => s + r.qty * r.harga, 0);
  const pajak = subTotal * pajakPct / 100;
  const diskon = subTotal * diskonPct / 100;
  const grandTotal = subTotal + pajak - diskon;

  // Baris
  const addRow = () => {
    setRows(prev => [...prev, { id: nextId, desc: 'Item baru', qty: 1, harga: 0 }]);
    setNextId(n => n + 1);
  };
  const delRow = (id) => setRows(prev => prev.filter(r => r.id !== id));
  const updateRow = (id, field, value) =>
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: field === 'desc' ? value : parseFloat(value) || 0 } : r
    ));

  // Supabase
  const saveData = async () => {
    const data = {
      no_faktur: invInfo.noFaktur,
      tanggal: invInfo.tanggal,
      jatuh_tempo: invInfo.jatuhTempo,
      company, client, payment, footer, rows,
      pajak_pct: pajakPct,
      diskon_pct: diskonPct,
      total: grandTotal,
    };
    const { error } = await supabase.from('invoices').insert([data]);
    if (error) { console.error(error); alert('Gagal simpan ke database'); }
    else alert('Berhasil simpan ke Supabase');
  };

  const loadData = async () => {
    const { data, error } = await supabase
      .from('invoices').select('*')
      .order('created_at', { ascending: false }).limit(1);
    if (error) { alert('❌ Gagal load data'); return; }
    if (!data || data.length === 0) { alert('Data kosong'); return; }
    const d = data[0];
    setCompany(d.company); setClient(d.client);
    setInvInfo({ noFaktur: d.no_faktur, tanggal: d.tanggal, jatuhTempo: d.jatuh_tempo });
    setPayment(d.payment); setRows(d.rows);
    setPajakPct(d.pajak_pct); setDiskonPct(d.diskon_pct); setFooter(d.footer);
  };

  // Helper setter
  const upd = (setter) => (field) => (e) =>
    setter(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <>
      {/*
        CSS khusus print: sembunyikan sidebar, full-width, landscape
        Letakkan juga di index.css / global.css jika ingin lebih rapi
      */}
      <style>{`
        @media print {
          .sidebar-no-print { display: none !important; }
          .invoice-scroll-area { padding: 0 !important; background: #fff !important; }
          .invoice-paper {
            box-shadow: none !important;
            width: 100% !important;
            min-height: unset !important;
          }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>

      <div style={S.wrapper}>

        {/* ── SIDEBAR ── */}
        <div className="sidebar-no-print" style={S.sidebar}>
          <SideBtn icon="💾" label="Simpan" onClick={saveData} />
          <SideBtn icon="📂" label="Muat" onClick={loadData} />
          <SideBtn icon="🖨️" label="Cetak" onClick={() => window.print()} extra={S.sideBtnPrint} />
        </div>

        {/* ── AREA SCROLL ── */}
        <div className="invoice-scroll-area" style={S.scrollArea}>
          <div className="invoice-paper inv-ls" style={S.invoice}>

            {/* label FAKTUR di tengah atas */}
            <div style={S.invoiceLabel}>F A K T U R</div>

            {/* ── HEADER ── */}
            <div style={S.invHeader}>
              {/* Kiri: logo + nama perusahaan */}
              <div style={S.logoArea}>
                <img style={S.logoImg} src={logo} alt="Logo" />
                <div style={S.companyName}>{company.name}</div>
              </div>

              {/* Kanan: info kontak perusahaan */}
              <div style={S.companyInfo}>
                <span style={S.lbl}>Alamat</span>
                <input style={S.field} value={company.alamat} onChange={upd(setCompany)('alamat')} />
                <span style={S.lbl}>Telp</span>
                <input style={S.field} value={company.telp} onChange={upd(setCompany)('telp')} />
                <span style={S.lbl}>Mail</span>
                <input style={S.field} value={company.mail} onChange={upd(setCompany)('mail')} />
                <span style={S.lbl}>Web</span>
                <input style={S.field} value={company.web} onChange={upd(setCompany)('web')} />
              </div>
            </div>

            {/* ── META (billing + faktur info) ── */}
            <div style={S.invMeta}>
              {/* Kiri: data klien */}
              <div style={{ ...S.boxBorder, ...S.accentLeft }}>
                <div style={S.metaLabel}>Tagihan kepada</div>
                <input
                  style={{ ...S.field, ...S.clientName }}
                  value={client.name}
                  onChange={upd(setClient)('name')}
                />
                <input
                  style={{ ...S.field, fontSize: 12, marginBottom: 6 }}
                  value={client.address}
                  onChange={upd(setClient)('address')}
                />
                <div style={S.companyInfo}>
                  <span style={S.lbl}>Telp</span>
                  <input style={S.field} value={client.telp} onChange={upd(setClient)('telp')} />
                  <span style={S.lbl}>Mail</span>
                  <input style={S.field} value={client.mail} onChange={upd(setClient)('mail')} />
                  <span style={S.lbl}>Web</span>
                  <input style={S.field} value={client.web} onChange={upd(setClient)('web')} />
                </div>
              </div>

              {/* Kanan: nomor faktur + metode bayar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={S.boxBorder}>
                  <div style={S.metaRow}>
                    <span style={S.lbl}>No. Faktur</span>
                    <input style={S.field} value={invInfo.noFaktur} onChange={upd(setInvInfo)('noFaktur')} />
                  </div>
                  <div style={S.metaRow}>
                    <span style={S.lbl}>Tanggal</span>
                    <input style={S.field} type="date" value={invInfo.tanggal} onChange={upd(setInvInfo)('tanggal')} />
                  </div>
                  <div style={S.metaRow}>
                    <span style={S.lbl}>Jatuh Tempo</span>
                    <input style={S.field} type="date" value={invInfo.jatuhTempo} onChange={upd(setInvInfo)('jatuhTempo')} />
                  </div>
                </div>

                <div style={S.boxBorder}>
                  <div style={S.paymentTitle}>Metode Pembayaran</div>
                  <input
                    style={{ ...S.field, fontSize: 11, color: '#888', marginBottom: 8 }}
                    value={payment.note}
                    onChange={upd(setPayment)('note')}
                  />
                  <div style={S.companyInfo}>
                    <span style={S.lbl}>Atas Nama</span>
                    <input style={S.field} value={payment.atasNama} onChange={upd(setPayment)('atasNama')} />
                    <span style={S.lbl}>Nama Bank</span>
                    <input style={S.field} value={payment.namaBank} onChange={upd(setPayment)('namaBank')} />
                    <span style={S.lbl}>No Rek</span>
                    <input style={S.field} value={payment.noRek} onChange={upd(setPayment)('noRek')} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── TABEL ITEM ── */}
            <table style={S.invTable}>
              <thead>
                <tr>
                  <th style={S.th}>Deskripsi</th>
                  <th style={{ ...S.th, textAlign: 'center', width: 70 }}>Qty</th>
                  <th style={{ ...S.th, textAlign: 'right', width: 180 }}>Harga</th>
                  <th style={{ ...S.th, textAlign: 'right', width: 180 }}>Total</th>
                  <th style={{ ...S.th, width: 32, textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : '#faf8fd' }}>
                    <td style={S.td}>
                      <input style={S.field} value={row.desc}
                        onChange={e => updateRow(row.id, 'desc', e.target.value)} />
                    </td>
                    <td style={{ ...S.td, ...S.tdCenter }}>
                      <input
                        style={{ ...S.field, textAlign: 'center', width: 50 }}
                        type="number" min="0" value={row.qty}
                        onChange={e => updateRow(row.id, 'qty', e.target.value)}
                      />
                    </td>
                    <td style={{ ...S.td, ...S.tdRight }}>
                      <div style={S.hargaWrap}>
                        <span style={S.rpLabel}>Rp.</span>
                        <input
                          style={{ ...S.field, textAlign: 'right', width: 130 }}
                          type="number" min="0" value={row.harga}
                          onChange={e => updateRow(row.id, 'harga', e.target.value)}
                        />
                      </div>
                    </td>
                    <td style={{ ...S.td, ...S.tdRight }}>{fmt(row.qty * row.harga)}</td>
                    <td style={{ ...S.td, ...S.tdCenter }}>
                      <button style={S.delRow} onClick={() => delRow(row.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button style={S.addRowBtn} onClick={addRow}>+ Tambah Baris</button>

            {/* ── FOOTER ── */}
            <div style={S.invFooter}>

              {/* Kiri: DUA tanda tangan */}
              <div style={S.signaturesRow}>
                {/* Tanda tangan 1: Hormat Kami */}
                <div style={S.signatureBox}>
                  <div style={S.sigCaption}>Hormat kami,</div>
                  <div style={S.sigLine} />
                  <input
                    style={{
                      ...S.field,
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#3d1f6e',
                      textAlign: 'center',
                    }}
                    value={footer.signerLeft}
                    onChange={upd(setFooter)('signerLeft')}
                  />
                </div>

                {/* Tanda tangan 2: Penerima */}
                <div style={S.signatureBox}>
                  <div style={S.sigCaption}>Penerima,</div>
                  <div style={S.sigLine} />
                  <input
                    style={{
                      ...S.field,
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#3d1f6e',
                      textAlign: 'center',
                    }}
                    value={footer.signerRight}
                    onChange={upd(setFooter)('signerRight')}
                  />
                </div>
              </div>

              {/* Kanan: Ringkasan total */}
              <div style={S.totals}>
                <div style={S.totalRow}>
                  <span>Sub Total</span>
                  <span>{fmt(subTotal)}</span>
                </div>
                <div style={S.totalRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Pajak PPN (
                    <input
                      style={{ ...S.field, width: 36, textAlign: 'center' }}
                      type="number" min="0" value={pajakPct}
                      onChange={e => setPajakPct(parseFloat(e.target.value) || 0)}
                    />
                    %)
                  </span>
                  <span>{fmt(pajak)}</span>
                </div>
                <div style={S.totalRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Diskon (
                    <input
                      style={{ ...S.field, width: 36, textAlign: 'center' }}
                      type="number" min="0" value={diskonPct}
                      onChange={e => setDiskonPct(parseFloat(e.target.value) || 0)}
                    />
                    %)
                  </span>
                  <span>{fmt(diskon)}</span>
                </div>
                <div style={{ ...S.totalRow, ...S.totalRowGrand }}>
                  <span>Total</span>
                  <span>{fmt(grandTotal)}</span>
                </div>
              </div>

            </div>{/* /invFooter */}

          </div>{/* /invoice-paper */}
        </div>{/* /scroll-area */}

      </div>{/* /wrapper */}
    </>
  );
}

// ── Helper: tombol sidebar ────────────────────────────────
function SideBtn({ icon, label, onClick, extra = {} }) {
  return (
    <button
      style={{ ...S.sideBtn, ...extra }}
      onClick={onClick}
      title={label}
      onMouseEnter={e => e.currentTarget.style.background = extra.background
        ? extra.background : '#555'}
      onMouseLeave={e => e.currentTarget.style.background = extra.background
        ? extra.background : '#3d3d3d'}
    >
      <span>{icon}</span>
      <span style={S.sideBtnLabel}>{label}</span>
    </button>
  );
}