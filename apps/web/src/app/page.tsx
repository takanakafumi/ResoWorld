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
    title: "Exploration Atlas",
    description:
      "すべての旅を単一の知識空間に統合し、地図・時代地層（STRATUM）・観点（LENS）で読み解きます。",
    status: "READY",
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
          <span className="stageBadge">FIELDWORK KNOWLEDGE ATLAS</span>
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
            <p className="privacyLabel">WORKSPACE &amp; PIPELINE</p>
            <h2>旅の記録から、歴史の層とつながりを育てる。</h2>
            <p>
              現地を歩いた一次体験（Document / Claim）を取り込み、時代地層（STRATUM）と5つの観点（LENS）を重ねて、地図上で根拠や次の探索候補を検証できます。
            </p>
          </div>
          <div className="homeActions">
            <Link className="privacyState" href="/imports">IMPORT &amp; ANALYZE</Link>
            <Link className="privacyState" data-primary="true" href="/review">OPEN EXPLORATION ATLAS</Link>
          </div>
        </aside>

        <section className="milestones" aria-labelledby="milestones-title">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">ARCHITECTURE</p>
              <h2 id="milestones-title">根拠から探索へ至る3つの層</h2>
            </div>
            <p>一次体験 × 時代地層 × 多角的レンズ</p>
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
