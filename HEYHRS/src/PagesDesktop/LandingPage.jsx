import { useState } from "react";
import logo from "../assets/Logo.png";
import "./LandingPage.css";

const PRODUCTS = [
  { name: "Deodorant Spray", tagline: "Fresh sepanjang hari", volume: "60ml", price: "Rp 49.000", color: "#F3E8FF", accent: "#8B5CF6" },
  { name: "Body Lotion", tagline: "Kulit lembut & bercahaya", volume: "150ml", price: "Rp 65.000", color: "#FFF7ED", accent: "#E8874A" },
  { name: "Face Mist", tagline: "Hidrasi instan seharian", volume: "100ml", price: "Rp 55.000", color: "#EDE9FE", accent: "#7B86C8" },
];

const BENEFITS = [
  { title: "Bahan Alami", desc: "Diformulasikan dari bahan pilihan yang aman untuk semua jenis kulit." },
  { title: "Dermatologi Tested", desc: "Telah diuji secara klinis dan aman digunakan setiap hari." },
  { title: "Tanpa Paraben", desc: "Bebas paraben, bebas sulfat — lembut untuk kulitmu." },
  { title: "Cruelty Free", desc: "Tidak diuji pada hewan. Cantik yang bertanggung jawab." },
];

export default function LandingPage() {
  const [activeProduct, setActiveProduct] = useState(0);
  const [form, setForm] = useState({ name: "", wa: "" });
  const [sent, setSent] = useState(false);

  const handleOrder = () => {
    if (!form.name.trim() || !form.wa.trim()) return;
    const msg = encodeURIComponent(
      `Halo HEYHRS! Saya ${form.name} ingin memesan *${PRODUCTS[activeProduct].name}*.\nNo WA: ${form.wa}`
    );
    window.open(`https://wa.me/6281234567890?text=${msg}`, "_blank");
    setSent(true);
  };

  return (
    <div className="lp-wrapper">
      <div className="lp-orb lp-orb--1" />
      <div className="lp-orb lp-orb--2" />

      {/* HEADER */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <img src={logo} alt="Logo" className="lp-logo" />
          <div>
            <div className="lp-brand">HEYHRS</div>
            <div className="lp-brand-sub">by PT. Putri Jagad Raya Jaya Abadi</div>
          </div>
        </div>
        <nav className="lp-nav">
          <a href="#produk">Produk</a>
          <a href="#keunggulan">Keunggulan</a>
          <a href="#order">Pesan</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-text">
          <div className="lp-badge">✦ Skincare & Beauty</div>
          <h1 className="lp-hero-title">
            Cantik dari dalam,<br />
            <span className="lp-hero-accent">terlihat dari luar.</span>
          </h1>
          <p className="lp-hero-desc">
            Produk kecantikan berkualitas tinggi, diformulasikan khusus untuk
            perempuan Indonesia. Aman, alami, dan terjangkau.
          </p>
          <div className="lp-hero-cta">
            <a href="#order" className="lp-btn-primary">Pesan Sekarang</a>
            <a href="#produk" className="lp-btn-ghost">Lihat Produk</a>
          </div>
        </div>
        <div className="lp-hero-visual">
          <div className="lp-hero-circle">
            <div className="lp-hero-circle-inner">🌸</div>
          </div>
          <div className="lp-hero-float lp-hero-float--1">Natural</div>
          <div className="lp-hero-float lp-hero-float--2">Aman & Teruji</div>
        </div>
      </section>

      {/* PRODUK */}
      <section className="lp-section" id="produk">
        <div className="lp-section-label">Produk Kami</div>
        <h2 className="lp-section-title">Temukan produk favoritmu</h2>
        <div className="lp-products">
          {PRODUCTS.map((p, i) => (
            <div
              key={i}
              className={`lp-product-card ${activeProduct === i ? "active" : ""}`}
              style={{ "--card-color": p.color, "--card-accent": p.accent }}
              onClick={() => setActiveProduct(i)}
            >
              <div className="lp-product-icon-wrap">
                <div className="lp-product-icon">✿</div>
              </div>
              <div className="lp-product-info">
                <div className="lp-product-name">{p.name}</div>
                <div className="lp-product-tagline">{p.tagline}</div>
                <div className="lp-product-meta">
                  <span className="lp-product-vol">{p.volume}</span>
                  <span className="lp-product-price">{p.price}</span>
                </div>
              </div>
              {activeProduct === i && <div className="lp-product-check">✓</div>}
            </div>
          ))}
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="lp-section lp-section--alt" id="keunggulan">
        <div className="lp-section-label">Mengapa HEYHRS?</div>
        <h2 className="lp-section-title">Keunggulan produk kami</h2>
        <div className="lp-benefits">
          {BENEFITS.map((b, i) => (
            <div className="lp-benefit-card" key={i}>
              <div className="lp-benefit-icon">✦</div>
              <div className="lp-benefit-title">{b.title}</div>
              <div className="lp-benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ORDER */}
      <section className="lp-section" id="order">
        <div className="lp-section-label">Pemesanan</div>
        <h2 className="lp-section-title">Pesan via WhatsApp</h2>
        <p className="lp-order-desc">
          Pilih produk di atas lalu isi form berikut. Kami akan membalas pesananmu segera.
        </p>
        <div className="lp-order-box">
          <div className="lp-order-preview">
            <div className="lp-order-preview-label">Produk dipilih</div>
            <div className="lp-order-preview-name">{PRODUCTS[activeProduct].name}</div>
            <div className="lp-order-preview-price">
              {PRODUCTS[activeProduct].price} · {PRODUCTS[activeProduct].volume}
            </div>
          </div>
          {!sent ? (
            <div className="lp-order-form">
              <input className="lp-input" type="text" placeholder="Nama lengkap kamu"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="lp-input" type="text" placeholder="Nomor WhatsApp (081234...)"
                value={form.wa} onChange={(e) => setForm({ ...form, wa: e.target.value })} />
              <button className="lp-btn-primary lp-btn-wa" onClick={handleOrder}>
                Pesan via WhatsApp &nbsp;
              </button>
            </div>
          ) : (
            <div className="lp-order-success">
              <div className="lp-success-icon">✓</div>
              <div>
                <div className="lp-success-title">Pesanan dikirim!</div>
                <div className="lp-success-sub">Cek WhatsApp kamu, kami segera membalas.</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src={logo} alt="Logo" className="lp-footer-logo" />
            <div>
              <div className="lp-footer-name">HEYHRS</div>
              <div className="lp-footer-tagline">Beauty & Skincare</div>
            </div>
          </div>
          <div className="lp-footer-copy">
            © 2025 PT. Putri Jagad Raya Jaya Abadi · heyhrs.vercel.app
          </div>
        </div>
      </footer>
    </div>
  );
}