import { useState, useEffect } from 'react';
import logo from '../assets/Logo.png';
import { supabase } from '../lib/supabase';
import { Printer, Save } from 'lucide-react';
import './faktur.css';

// ── Format Rupiah ──
const fmt = (n) => 'Rp. ' + Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2 });

// ── Generate Nomor Faktur dari Supabase ──
const generateNoFaktur = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('no_faktur')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return 'F001';

  // Ambil semua nomor, cari angka terbesar
  const numbers = data
    .map((row) => {
      const match = row.no_faktur?.match(/^F(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  const next = maxNum + 1;
  return 'F' + String(next).padStart(3, '0'); // F001, F002, ...
};

// ── Data awal ──
const DEFAULT_COMPANY = {
  name: 'PT. Putri Jagad Raya\nJaya Abadi',
  alamat: 'PERUM MENDUT BLOK N-22, RT. 003, RW. 004, TAMANBARU, BANYUWANGI,',
  telp: '+62 85113124668',
  mail: 'putrijagadrayajayaabadi@gmail.com',
  web: 'heyhrs.vercel.app',
};
const DEFAULT_CLIENT = {
  name: 'BAMBANG YUDISTIRA',
  address: 'Jln Anggrek No 71',
  telp: '+62 85064477225',
  mail: 'bambangyudis@gmail.com',
};
const DEFAULT_INVOICE = { noFaktur: '', tanggal: '2026-2-12', jatuhTempo: '2026-2-17' };
const DEFAULT_PAYMENT = { note: '', atasNama: 'PT. Putri Jagad Raya Jaya Abadi', namaBank: 'Bank Kota Borcelle', noRek: '#123/456/7890' };
const DEFAULT_ROWS = [
  { id: 1, desc: 'Deadoran Spray Heyhrs (60Ml)', qty: 1, harga: 49000 },
];
const DEFAULT_FOOTER = { syarat: '', signerLeft: 'Pengirim', signerRight: 'Penerima' };

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
  const [loadingFaktur, setLoadingFaktur] = useState(true);

  // ── Auto-generate nomor faktur saat komponen mount ──
  useEffect(() => {
    const fetchNoFaktur = async () => {
      setLoadingFaktur(true);
      const noFaktur = await generateNoFaktur();
      setInvInfo((prev) => ({ ...prev, noFaktur }));
      setLoadingFaktur(false);
    };
    fetchNoFaktur();
  }, []);

  // Kalkulasi
  const subTotal = rows.reduce((s, r) => s + r.qty * r.harga, 0);
  const pajak = (subTotal * pajakPct) / 100;
  const diskon = (subTotal * diskonPct) / 100;
  const grandTotal = subTotal + pajak - diskon;

  // Handler Baris
  const addRow = () => { setRows((prev) => [...prev, { id: nextId, desc: 'Barang Baru', qty: 1, harga: 0 }]); setNextId((n) => n + 1); };
  const delRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id, field, value) => setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: field === 'desc' ? value : parseFloat(value) || 0 } : r));

  // Supabase Save
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
    if (error) {
      console.error(error);
      alert('Gagal simpan ke database');
    } else {
      alert('Berhasil simpan ke Supabase');
      // Generate nomor faktur baru untuk faktur berikutnya
      const newNo = await generateNoFaktur();
      setInvInfo((prev) => ({ ...prev, noFaktur: newNo }));
    }
  };

  const upd = (setter) => (field) => (e) => setter((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="invoice-wrapper">

      {/* ── HEADER HALAMAN ── */}
      <div className="page-header no-print">
        <div className="page-header-left">
          <img className="page-header-logo" src={logo} alt="Logo" />
          <div>
            <div className="page-header-brand">PT. Putri Jagad Raya Jaya Abadi</div>
            <div className="page-header-subtitle">Sales Invoice</div>
          </div>
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
            {/* Logo diperbesar */}
            <div className="logo-area">
              <img className="logo-img logo-img--large" src={logo} alt="Logo" />
              <div className="company-name">{company.name}</div>
            </div>
            <div className="faktur-label">F A K T U R</div>
            <div className="company-info">
              <span className="lbl">Alamat</span>
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
              </div>
            </div>

            <div className="meta-right-col">
              <div className="meta-box-compact">
                <div className="meta-row">
                  <span className="lbl">No. Faktur</span>
                  {/* Nomor Faktur kini tampil sebagai teks, bukan input */}
                  <span className="no-faktur-display">
                    {loadingFaktur ? 'Memuat...' : invInfo.noFaktur}
                  </span>
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
                <th className="col-action no-print"></th>
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
                  <td className="td-center no-print">
                    <button className="del-row" onClick={() => delRow(row.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="add-row-btn no-print" onClick={addRow}>+ Tambah Baris</button>

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
              <div className="total-row">
                <span className="tax-discount-wrap">
                  Pajak PPN (<input className="pajak-diskon-input" type="number" min="0" value={pajakPct} onChange={(e) => setPajakPct(parseFloat(e.target.value) || 0)} />%)
                </span>
                <span>{fmt(pajak)}</span>
              </div>
              <div className="total-row">
                <span className="tax-discount-wrap">
                  Diskon (<input className="pajak-diskon-input" type="number" min="0" value={diskonPct} onChange={(e) => setDiskonPct(parseFloat(e.target.value) || 0)} />%)
                </span>
                <span>{fmt(diskon)}</span>
              </div>
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