import { useLanguage } from "../contexts/LanguageContext";

const OFFICIAL_CUSTOMS_URL = "https://customs.gov.az/en/ferdler-ucun/fiziki-sexsler-ucun-melumat";
const DECLARATION_URL = "https://e.customs.gov.az/for-individuals/post-declaration";

export function CustomsGuide() {
  const { t } = useLanguage();

  return (
    <section className="panel customs-panel" aria-label={t("customsTitle")}>
      <div className="panel-heading">
        <div>
          <div className="eyebrow">{t("customsEyebrow")}</div>
          <h2>{t("customsTitle")}</h2>
          <p>{t("customsDescription")}</p>
        </div>
      </div>

      <div className="customs-grid">
        <article className="customs-card">
          <span className="customs-card-label">{t("customsPostalLimit")}</span>
          <p>{t("customsPostalLimitText")}</p>
          <a href={OFFICIAL_CUSTOMS_URL} target="_blank" rel="noreferrer">
            {t("customsOfficialSource")}
          </a>
        </article>
        <article className="customs-card">
          <span className="customs-card-label">{t("customsDeclaration")}</span>
          <p>{t("customsDeclarationText")}</p>
          <a href={DECLARATION_URL} target="_blank" rel="noreferrer">
            {t("customsDeclarationLink")}
          </a>
        </article>
        <article className="customs-card">
          <span className="customs-card-label">{t("customsSupport")}</span>
          <p>{t("customsSupportText")}</p>
          <a href={OFFICIAL_CUSTOMS_URL} target="_blank" rel="noreferrer">
            {t("customsOfficialSource")}
          </a>
        </article>
      </div>

      <p className="muted-note customs-disclaimer">{t("customsDisclaimer")}</p>
    </section>
  );
}
