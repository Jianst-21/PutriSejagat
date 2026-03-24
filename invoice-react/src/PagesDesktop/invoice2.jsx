import { useState, useEffect, useCallback } from 'react';
import '../index.css';
import logo from '../assets/Logo.jpeg';
import { supabase } from '../lib/supabase';

// ── Format Rupiah ──────────────────────────────────────────
const fmt = (n) =>
  'Rp. ' + Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2 });

// ── Data awal invoice ──────────────────────────────────────
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
  signer: 'Direktur Utama',
};

// ── Komponen utama ─────────────────────────────────────────
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

  // ── Kalkulasi ────────────────────────────────────────────
  const subTotal = rows.reduce((s, r) => s + r.qty * r.harga, 0);
  const pajak = subTotal * pajakPct / 100;
  const diskon = subTotal * diskonPct / 100;
  const grandTotal = subTotal + pajak - diskon;

  // ── Baris tabel ──────────────────────────────────────────
  const addRow = () => {
    setRows(prev => [...prev, { id: nextId, desc: 'Item baru', qty: 1, harga: 0 }]);
    setNextId(n => n + 1);
  };

  const delRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: field === 'desc' ? value : parseFloat(value) || 0 } : r
    ));
  };

  // ── Simpan & Muat (localStorage) ─────────────────────────
  const saveData = async () => {
  const data = {
    no_faktur: invInfo.noFaktur,
    tanggal: invInfo.tanggal,
    jatuh_tempo: invInfo.jatuhTempo,
    company,
    client,
    payment,
    footer,
    rows,
    pajak_pct: pajakPct,
    diskon_pct: diskonPct,
    total: grandTotal
  };

  const { error } = await supabase
    .from('invoices')
    .insert([data]);

  if (error) {
    console.error(error);
    alert('Gagal simpan ke database');
    console.log(data);
  } else {
    alert('Berhasil simpan ke Supabase');
    console.log(data);
  }
};

  const loadData = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    alert('❌ Gagal load data');
    return;
  }

  if (!data || data.length === 0) {
    alert('Data kosong');
    return;
  }

  const d = data[0];

  setCompany(d.company);
  setClient(d.client);
  setInvInfo({
    noFaktur: d.no_faktur,
    tanggal: d.tanggal,
    jatuhTempo: d.jatuh_tempo,
  });
  setPayment(d.payment);
  setRows(d.rows);
  setPajakPct(d.pajak_pct);
  setDiskonPct(d.diskon_pct);
  setFooter(d.footer);
};

  // // Auto-load saat pertama buka
  // useEffect(() => {
  //   const raw = localStorage.getItem('invoice_react');
  //   if (raw) loadData();
  // }, []);

  // ── Helper: update object state ──────────────────────────
  const upd = (setter) => (field) => (e) =>
    setter(prev => ({ ...prev, [field]: e.target.value }));

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {/* TOOLBAR */}
      <div className="toolbar">
        <button className="btn btn-white" onClick={saveData}>💾 Simpan</button>
        <button className="btn btn-white" onClick={loadData}>📂 Muat</button>
        <button className="btn btn-dark" onClick={() => window.print()}>🖨️ Cetak / PDF</button>
      </div>

      {/* INVOICE */}
      <div className="invoice">

        {/* ── HEADER ── */}
        <div className="inv-header">

          {/* label kecil */}
          <div className="invoice-label">FAKTUR</div>

          {/* kiri */}
          <div className="header-left">
            <div className="logo-area">
              <img className="logo-img" src={logo} alt="Logo PT" />

              <div className="company-name" style={{ whiteSpace: 'pre-line' }}>
                {company.name}
              </div>
            </div>
          </div>

          {/* kanan */}
          <div className="header-right">
            <div className="company-info">
              <span className="lbl">Alamat</span>
              <input className="field" value={company.alamat} onChange={upd(setCompany)('alamat')} />

              <span className="lbl">Telp</span>
              <input className="field" value={company.telp} onChange={upd(setCompany)('telp')} />

              <span className="lbl">Mail</span>
              <input className="field" value={company.mail} onChange={upd(setCompany)('mail')} />

              <span className="lbl">Web</span>
              <input className="field" value={company.web} onChange={upd(setCompany)('web')} />
            </div>
          </div>

        </div>

        {/* ── BILLING + META ── */}
        <div className="inv-meta">

          {/* Kiri: Data Klien */}
          <div className="box-border accent-left">
            <div className="meta-label">Tagihan kepada</div>
            <input
              className="field client-name-display"
              value={client.name}
              onChange={upd(setClient)('name')}
              style={{ display: 'block', width: '100%', marginBottom: 4 }}
            />
            <input
              className="field client-address"
              value={client.address}
              onChange={upd(setClient)('address')}
              style={{ display: 'block', width: '100%' }}
            />
            <div className="company-info">
              <span className="lbl">Telp</span>
              <input className="field" value={client.telp} onChange={upd(setClient)('telp')} />
              <span className="lbl">Mail</span>
              <input className="field" value={client.mail} onChange={upd(setClient)('mail')} />
              <span className="lbl">Web</span>
              <input className="field" value={client.web} onChange={upd(setClient)('web')} />
            </div>
          </div>

          {/* Kanan: Nomor Faktur + Metode Bayar */}
          <div>
            <div className="box-border">
              <div className="meta-row">
                <span className="lbl">Nomer Faktur</span>
                <input className="field" value={invInfo.noFaktur} onChange={upd(setInvInfo)('noFaktur')} />
              </div>
              <div className="meta-row">
                <span className="lbl">Tanggal</span>
                <input className="field" type="date" value={invInfo.tanggal} onChange={upd(setInvInfo)('tanggal')} />
              </div>
              <div className="meta-row due-date-row">
                <span className="lbl">Jatuh Tempo</span>
                <input className="field" type="date" value={invInfo.jatuhTempo} onChange={upd(setInvInfo)('jatuhTempo')} />
              </div>
            </div>

            <div className="box-border payment-box">
              <div className="payment-title">Metode Pembayaran</div>
              <input
                className="field"
                value={payment.note}
                onChange={upd(setPayment)('note')}
                style={{ display: 'block', width: '100%', fontSize: 12, color: 'var(--gray-text)', marginBottom: 10 }}
              />
              <div className="company-info">
                <span className="lbl">Atas Nama</span>
                <input className="field" value={payment.atasNama} onChange={upd(setPayment)('atasNama')} />
                <span className="lbl">Nama Bank</span>
                <input className="field" value={payment.namaBank} onChange={upd(setPayment)('namaBank')} />
                <span className="lbl">No Rek</span>
                <input className="field" value={payment.noRek} onChange={upd(setPayment)('noRek')} />
              </div>
            </div>
          </div>

        </div>{/* /inv-meta */}

        {/* ── TABEL ITEM ── */}
        <table className="inv-table">
          <thead>
            <tr>
              <th>Diskripsi</th>
              <th className="center">Qty</th>
              <th className="right">Harga</th>
              <th className="right">Total</th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>
                  <input
                    className="field"
                    value={row.desc}
                    onChange={e => updateRow(row.id, 'desc', e.target.value)}
                  />
                </td>
                <td className="center">
                  <input
                    className="field center qty-input"
                    type="number"
                    min="0"
                    value={row.qty}
                    onChange={e => updateRow(row.id, 'qty', e.target.value)}
                    style={{ width: 60, textAlign: 'center' }}
                  />
                </td>
                <td className="right">
                  <div className="harga-wrap">
                    <span className="rp-label">Rp.</span>
                    <input
                      className="field right harga-input"
                      type="number"
                      min="0"
                      value={row.harga}
                      onChange={e => updateRow(row.id, 'harga', e.target.value)}
                    />
                  </div>
                </td>
                <td className="right">{fmt(row.qty * row.harga)}</td>
                <td>
                  <button className="del-row" title="Hapus baris" onClick={() => delRow(row.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="add-row-btn" onClick={addRow}>+ Tambah Baris</button>

        {/* ── FOOTER ── */}
        <div className="inv-footer">

          {/* Kiri: Syarat & Tanda Tangan */}
          <div>
            <div className="signature-area">
              <div style={{ fontSize: 12, color: 'var(--gray-text)' }}>Hormat kami,</div>
              <div className="sig-line" />
              <input
                className="field"
                value={footer.signer}
                onChange={upd(setFooter)('signer')}
                style={{ fontWeight: 700, fontSize: 14, color: 'var(--purple-dark)', textAlign: 'center', display: 'block', width: '100%' }}
              />
            </div>
          </div>

          {/* Kanan: Ringkasan Total */}
          <div className="totals">
            <div className="total-row">
              <span>Sub Total</span>
              <span>{fmt(subTotal)}</span>
            </div>
            <div className="total-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Pajak PPN (
                <input
                  className="field center"
                  type="number"
                  min="0"
                  value={pajakPct}
                  onChange={e => setPajakPct(parseFloat(e.target.value) || 0)}
                  style={{ width: 36 }}
                />
                %)
              </span>
              <span>{fmt(pajak)}</span>
            </div>
            <div className="total-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Diskon (
                <input
                  className="field center"
                  type="number"
                  min="0"
                  value={diskonPct}
                  onChange={e => setDiskonPct(parseFloat(e.target.value) || 0)}
                  style={{ width: 36 }}
                />
                %)
              </span>
              <span>{fmt(diskon)}</span>
            </div>
            <div className="total-row grand">
              <span>Total</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>

        </div>{/* /inv-footer */}

      </div>{/* /invoice */}
    </>
  );
}