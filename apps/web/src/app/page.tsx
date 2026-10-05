import Link from "next/link";

const milestones = [
  {
    step: "01",
    title: "Evidence schema",
    description:
      "Claim・Evidence・時間・場所・由来を、根拠へ戻れる形で定義します。",
    status: "READY",
  },
  {
    step: "02",
    title: "Local import",
    description:
      "探索記録をDocumentとPassageへ変換し、選択したプロバイダーで分析します。",
    status: "READY",
  },
  {
    step: "03",
    title: "Evidence Graph",
    description:
      "場所と知識の線を、その根拠・性質・時代とともにレビューします。",
    status: "CURRENT",
  },
] as const;

export default function Home() {
  return (
    <main>
      <div className="ambient ambientLeft" />
      <div className="ambient ambientRight" />

      <section className="shell">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="ResoWorld home">
            <span className="brandMark" aria-hidden="true">
              ◉
            </span>
            <span>RESOWORLD</span>
          </a>
          <span className="stageBadge">PROVIDER-FLEXIBLE POC</span>
        </header>

        <div className="hero" id="top">
          <p className="eyebrow">EXPLORATION EVIDENCE SYSTEM</p>
          <h1>
            世界の<span>解像度</span>
          </h1>
          <p className="tagline">歩くほど、世界がつながる。</p>
          <p className="lead">
            旅で見たもの、後から知ったこと、まだ確かめていない仮説。
            <br />
            それらを混ぜずに重ね、自分が歩いた世界を育てていく。
          </p>
        </div>

        <aside className="privacyBoundary">
          <div className="privacyIcon" aria-hidden="true">
            ⌾
          </div>
          <div>
            <p className="privacyLabel">PROCESSING CHOICE</p>
            <h2>探索記録の処理場所と文脈範囲を選べます。</h2>
            <p>
              ローカルLLMとサーバーモデルを用途に応じて使い分け、Evidence Graphの線からClaimと原文へ戻って人が採否を判断します。現在のPoCデータはGitへ追加しません。
            </p>
          </div>
          <div className="homeActions">
            <Link className="privacyState" href="/imports">IMPORT & ANALYZE</Link>
            <Link className="privacyState" data-primary="true" href="/review">OPEN EVIDENCE GRAPH</Link>
          </div>
        </aside>

        <section className="milestones" aria-labelledby="milestones-title">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">POC PATH</p>
              <h2 id="milestones-title">根拠のある接続から始める</h2>
            </div>
            <p>宗像 → 宇佐 → 国東</p>
          </div>

          <div className="milestoneGrid">
            {milestones.map((milestone) => (
              <article className="milestoneCard" key={milestone.step}>
                <div className="cardMeta">
                  <span>{milestone.step}</span>
                  <span data-status={milestone.status}>{milestone.status}</span>
                </div>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </article>
            ))}
          </div>
        </section>

        <footer>
          <span>Explore the world.</span>
          <span>Connect the dots.</span>
          <span>See more.</span>
        </footer>
      </section>
    </main>
  );
}
