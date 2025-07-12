import React, { useRef, useEffect } from 'react';

function NotFoundPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Resize canvas
    canvas.width = width;
    canvas.height = height;

    const columns = Math.floor(width / 10);
    const drops = Array.from({ length: columns }, () => Math.random() * height);

    const characters = '0123456789ABCDEF'.split('');

    const colors = [
      'rgba(219,39,119,0.8)', // gradient start
      'rgba(147,51,234,0.8)', // gradient end
    ];

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.font = '14px monospace';

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;

        ctx.fillText(
          text,
          i * 10,
          drops[i]
        );

        if (drops[i] > height || Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += Math.random() * 4 + 1;
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const gradientColors = ['rgb(219, 39, 119)', 'rgb(147, 51, 234)'];
  const gradient = `linear-gradient(90deg, ${gradientColors.join(', ')})`;

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden',
      fontFamily: 'monospace, monospace',
    }}>
      {/* Canvas for falling characters */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 0,
        }}
      />

      {/* Content overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        padding: '20px',
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: `0 0 20px ${gradient}`,
        }}>
          {/* Gradient text for "404" */}
          <h1 style={{
            fontSize: '8em',
            margin: 0,
            background: `linear-gradient(90deg, ${gradientColors.join(', ')})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: `0 0 10px ${gradient}`,
          }}>
            404
          </h1>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              fontSize: '1em',
              color: '#fff',
              background: `linear-gradient(90deg, ${gradientColors.join(', ')})`,
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
              boxShadow: `0 0 10px ${gradient}`,
            }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;