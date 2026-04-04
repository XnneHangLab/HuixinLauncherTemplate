import { heroConfetti, heroCopy } from '../../../data/home';

export function HeroBanner() {
  return (
    <section className="hero">
      <div className="mountains" aria-hidden="true">
        <div className="mountain" />
        <div className="mountain" />
        <div className="mountain" />
        <div className="mountain" />
        <div className="mountain" />
      </div>

      <div className="confetti" aria-hidden="true">
        {heroConfetti.map((piece) => (
          <span
            key={`${piece.top}-${piece.left}`}
            style={{
              top: piece.top,
              left: piece.left,
              ['--c' as string]: piece.color,
              ['--r' as string]: piece.rotate,
              width: piece.width,
            }}
          />
        ))}
      </div>

      <div className="hero-copy">
        <div className="hero-copy__eyebrow">{heroCopy.eyebrow}</div>
        <h1>{heroCopy.title}</h1>
        <p>{heroCopy.description}</p>
      </div>
    </section>
  );
}
