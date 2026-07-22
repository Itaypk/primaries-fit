import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useMeta } from "../meta";
import { DEFAULT_ACCENT } from "../theme";
import { AppFrame } from "../components/AppFrame";
import { Header } from "../components/Header";
import { PageLinks } from "../components/PageLinks";

/** The Q&A / FAQ page (`/faq`). Static, top-level route; a flat list of
 *  question/answer pairs from the shared catalog. */
export function FaqScreen() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const f = t.ui.faq;
  useMeta({ title: `${f.title} · ${t.app.name}`, description: f.sub, url: "/faq", locale });

  return (
    <AppFrame accent={DEFAULT_ACCENT}>
      <Header showBack onBack={() => navigate(-1)} />
      <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "6px 24px 26px" }}>
        <div className="candidate-column">
          <h1 className="serif" style={{ fontSize: "29px", fontWeight: 700, color: "#221e1a", margin: "8px 0 6px" }}>
            {f.title}
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#6b6152", margin: "0 0 20px" }}>{f.sub}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {f.items.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #eee3d3",
                  borderRadius: "16px",
                  padding: "15px 17px",
                }}
              >
                <h2 className="serif" style={{ fontSize: "17px", fontWeight: 700, color: "#2b2622", margin: "0 0 6px" }}>
                  {item.q}
                </h2>
                <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: "#5c5346", margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>

          <PageLinks hide="faq" />
        </div>
      </div>
    </AppFrame>
  );
}
