import { useState } from 'react';
import logo from '../assets/Logo.png';
import { supabase } from '../lib/supabase';
import { Printer, Save } from 'lucide-react';
import './invoice.css'; // Hanya panggil ini, tidak butuh index.css lagi
// ── Format Rupiah ──
const fmt = (n) => 'Rp. ' + Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2 });

// ── Data awal ──
const DEFAULT_COMPANY = {
  name: 'PT. Putri Jagad Raya\nJaya Abadi',
  alamat: 'PERUM MENDUT BLOK N-22, RT. 003, RW. 004, TAMANBARU, BANYUWANGI,',
  telp: '+123-456-7890',
  mail: 'hello@putrijagad.com',
  web: 'www.putrijagad.com',
};
const DEFAULT_CLIENT = {
  name: 'Sacha Dubois',
  address: '123 Anywhere St., Any City, ST 12345',
  telp: '+123-456-7890',
  mail: 'hello@reallygreatsite.com',
  web: 'www.reallygreatsite.com',
};
const DEFAULT_INVOICE = { noFaktur: 'inv-1234567890', tanggal: '2026-12-12', jatuhTempo: '2026-12-17' };
const DEFAULT_PAYMENT = { note: '', atasNama: 'PT. Putri Jagad Raya Jaya Abadi', namaBank: 'Bank Kota Borcelle', noRek: '#123/456/7890' };
const DEFAULT_ROWS = [
  { id: 1, desc: 'Barang A', qty: 1, harga: 15000000 },
  { id: 2, desc: 'Barang B', qty: 1, harga: 1000000 },
];
const DEFAULT_FOOTER = { syarat: '', signerLeft: 'Direktur Utama', signerRight: 'Penerima' };

export default function Invoice() {
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [client, setClient] = useState(DEFAULT_CLIENT);
  const [invInfo, setInvInfo] = useState(DEFAULT_INVOICE);
  const [payment, setPayment] = useState(DEFAULT_PAYMENT);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [pajakPct, setPajakPct] = useState(11);
  const [diskonPct, setDiskonPct] = useState(0);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [nextId, setNextId] = useState(3);

  // Kalkulasi
  const subTotal = rows.reduce((s, r) => s + r.qty * r.harga, 0);
  const pajak = (subTotal * pajakPct) / 100;
  const diskon = (subTotal * diskonPct) / 100;
  const grandTotal = subTotal + pajak - diskon;

  // Handler Baris
  const addRow = () => { setRows((prev) => [...prev, { id: nextId, desc: 'Barang Baru', qty: 1, harga: 0 }]); setNextId((n) => n + 1); };
  const delRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id, field, value) => setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: field === 'desc' ? value : parseFloat(value) || 0 } : r));

  // Supabase
  const saveData = async () => {
    const data = {
      no_faktur: invInfo.noFaktur, tanggal: invInfo.tanggal, jatuh_tempo: invInfo.jatuhTempo,
      company, client, payment, footer, rows, pajak_pct: pajakPct, diskon_pct: diskonPct, total: grandTotal,
    };
    const { error } = await supabase.from('invoices').insert([data]);
    if (error) { console.error(error); alert('Gagal simpan ke database'); }
    else alert('Berhasil simpan ke Supabase');
  };

  const upd = (setter) => (field) => (e) => setter((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="invoice-wrapper">

      {/* ── HEADER HALAMAN ── */}
      <div className="page-header no-print">
        <div className="page-header-left">
          <img className="page-header-logo" src={logo} alt="Logo" />
          <div className="page-header-title">PT. Putri Jagad<br />Raya Jaya Abadi</div>
        </div>
        <div className="page-header-right">
          <button className="btn-simpan" onClick={saveData}>
            <Save size={18} /> Simpan
          </button>
          <button className="btn-cetak" onClick={() => window.print()}>
            <Printer size={18} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* ── AREA SCROLL KERTAS ── */}
      <div className="invoice-scroll-area">
        <div className="invoice-paper">

          {/* ── HEADER FAKTUR ── */}
          <div className="inv-header">
            <div className="logo-area">
              <img className="logo-img" src={logo} alt="Logo" />
              <div className="company-name">{company.name}</div>
            </div>
            <div className="faktur-label">F A K T U R</div>
            <div className="company-info">
              <span className="lbl">Alamat</span>
              {/* Tambahkan className="address-text" di sini */}
              <span className="address-text">{company.alamat}</span>
              
              <span className="lbl">Telp</span>
              <span>{company.telp}</span>
              
              <span className="lbl">Mail</span>
              <span>{company.mail}</span>
              
              <span className="lbl">Web</span>
              <span>{company.web}</span>
            </div>
          </div>

          {/* ── META FAKTUR ── */}
          <div className="inv-meta">
            <div className="meta-box accent-left">
              <div className="meta-label">Tagihan Kepada</div>
              <input className="field client-name" value={client.name} onChange={upd(setClient)('name')} />
              <textarea className="field client-address-area" value={client.address} onChange={upd(setClient)('address')} />
              <div className="company-info">
                <span className="lbl">Telp</span>
                <input className="field" value={client.telp} onChange={upd(setClient)('telp')} />
                <span className="lbl">Mail</span>
                <input className="field" value={client.mail} onChange={upd(setClient)('mail')} />
                <span className="lbl">Web</span>
                <input className="field" value={client.web} onChange={upd(setClient)('web')} />
              </div>
            </div>

            <div className="meta-right-col">
              <div className="meta-box-compact">
                <div className="meta-row">
                  <span className="lbl">No. Faktur</span>
                  <input className="field" value={invInfo.noFaktur} onChange={upd(setInvInfo)('noFaktur')} />
                  <span></span>
                </div>
                <div className="meta-row">
                  <span className="lbl">Tanggal</span>
                  <input className="field" type="date" value={invInfo.tanggal} onChange={upd(setInvInfo)('tanggal')} />
                </div>
                <div className="meta-row meta-row-last">
                  <span className="lbl">Jatuh Tempo</span>
                  <input className="field" type="date" value={invInfo.jatuhTempo} onChange={upd(setInvInfo)('jatuhTempo')} />
                </div>
              </div>

              <div className="meta-box-compact">
                <div className="payment-title">Metode Pembayaran</div>
                <div className="company-info payment-info">
                  <span className="lbl">Atas Nama</span>
                  <input className="field" value={payment.atasNama} onChange={upd(setPayment)('atasNama')} />
                  <span className="lbl">Nama Bank</span>
                  <input className="field" value={payment.namaBank} onChange={upd(setPayment)('namaBank')} />
                  <span className="lbl">No Rek</span>
                  <input className="field" value={payment.noRek} onChange={upd(setPayment)('noRek')} />
                </div>
              </div>
            </div>
          </div>

          {/* ── TABEL ── */}
          <table className="inv-table">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th className="col-qty">Qty</th>
                <th className="col-harga">Harga</th>
                <th className="col-total">Total</th>
                <th className="col-action"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input className="field" value={row.desc} onChange={(e) => updateRow(row.id, 'desc', e.target.value)} />
                  </td>
                  <td className="td-center">
                    <input className="field td-center" type="number" min="0" value={row.qty} onChange={(e) => updateRow(row.id, 'qty', e.target.value)} />
                  </td>
                  <td className="td-center">
                    <div className="harga-wrap">
                      <span className="rp-label">Rp.</span>
                      <input className="field input-harga" type="number" min="0" value={row.harga} onChange={(e) => updateRow(row.id, 'harga', e.target.value)} />
                    </div>
                  </td>
                  <td className="td-center">{fmt(row.qty * row.harga)}</td>
                  <td className="td-center">
                    <button className="del-row" onClick={() => delRow(row.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="add-row-btn" onClick={addRow}>+ Tambah Baris</button>

          {/* ── FOOTER ── */}
          <div className="inv-footer">
            <div className="signatures-row">
              <div className="signature-box">
                <div className="sig-caption">Hormat kami,</div>
                <div className="sig-line" />
                <input className="field signer-input" value={footer.signerLeft} onChange={upd(setFooter)('signerLeft')} />
              </div>
              <div className="signature-box">
                <div className="sig-caption">Penerima,</div>
                <div className="sig-line" />
                <input className="field signer-input" value={footer.signerRight} onChange={upd(setFooter)('signerRight')} />
              </div>
            </div>

            {/* TOTAL */}
            <div className="totals">
              <div className="total-row">
                <span>Sub Total</span>
                <span>{fmt(subTotal)}</span>
              </div>

              {/* PAJAK - Dibuat sangat rapat dan menyatu */}
              <div className="total-row">
                <span className="tax-discount-wrap">
                  Pajak PPN (<input className="pajak-diskon-input" type="number" min="0" value={pajakPct} onChange={(e) => setPajakPct(parseFloat(e.target.value) || 0)} />%)
                </span>
                <span>{fmt(pajak)}</span>
              </div>

              {/* DISKON */}
              <div className="total-row">
                <span className="tax-discount-wrap">
                  Diskon (<input className="pajak-diskon-input" type="number" min="0" value={diskonPct} onChange={(e) => setDiskonPct(parseFloat(e.target.value) || 0)} />%)
                </span>
                <span>{fmt(diskon)}</span>
              </div>

              {/* GRAND TOTAL */}
              <div className="total-row total-row-grand">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}