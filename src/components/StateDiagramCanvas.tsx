import { useEffect, useRef } from 'react';
import { DiagramToken, tokenizePattern } from '../lib/regex';

type StateDiagramCanvasProps = {
  pattern: string;
  activeTokenIndex: number;
  flags: string;
};

const colorByType: Record<DiagramToken['tokenType'], string> = {
  anchor: '#fbbf24',
  class: '#22d3ee',
  group: '#a78bfa',
  lookaround: '#fb7185',
  quantifier: '#34d399',
  literal: '#cbd5e1',
};

export function StateDiagramCanvas({ pattern, activeTokenIndex, flags }: StateDiagramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const tokens = tokenizePattern(pattern);
    const width = 900;
    const height = 220;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#020617');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const startX = 50;
    const y = 110;
    const gap = Math.max(44, Math.min(90, Math.floor(760 / Math.max(tokens.length, 1))));

    const drawNode = (
      x: number,
      label: string,
      color: string,
      isActive: boolean,
      shape: 'circle' | 'capsule' = 'capsule',
    ) => {
      ctx.save();
      ctx.strokeStyle = isActive ? '#e2e8f0' : color;
      ctx.fillStyle = isActive ? '#e2e8f0' : '#0b1120';
      ctx.lineWidth = isActive ? 3 : 2;

      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        const w = 36;
        const h = 28;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - h / 2, w, h, 12);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = isActive ? '#0f172a' : '#e2e8f0';
      ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.length > 5 ? `${label.slice(0, 4)}…` : label, x, y);
      ctx.restore();
    };

    const drawArrow = (fromX: number, toX: number) => {
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.fillStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, y);
      ctx.lineTo(toX, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, y);
      ctx.lineTo(toX - 8, y - 4);
      ctx.lineTo(toX - 8, y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawNode(startX, 'S', '#60a5fa', false, 'circle');

    let x = startX;
    tokens.forEach((token, index) => {
      const nextX = x + gap;
      drawArrow(x + 18, nextX - 20);
      drawNode(nextX, token.label, colorByType[token.tokenType], index === activeTokenIndex);
      x = nextX;
    });

    const acceptX = x + gap;
    drawArrow(x + 18, acceptX - 18);
    drawNode(acceptX, 'A', '#22c55e', false, 'circle');

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Tokens: ${tokens.length}  •  Flags: ${flags || '(none)'}`, 18, 24);

    const legend = [
      ['literal', '#cbd5e1'],
      ['class', '#22d3ee'],
      ['group', '#a78bfa'],
      ['lookaround', '#fb7185'],
      ['quantifier', '#34d399'],
      ['anchor', '#fbbf24'],
    ] as const;

    legend.forEach(([label, color], idx) => {
      const offsetX = 18 + idx * 145;
      ctx.fillStyle = color;
      ctx.fillRect(offsetX, 190, 12, 12);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(label, offsetX + 18, 196);
    });
  }, [activeTokenIndex, flags, pattern]);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <h3 className="mb-2 text-sm font-semibold text-white">State Diagram (Canvas 2D)</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/80 p-2">
        <canvas ref={canvasRef} className="block" />
      </div>
    </section>
  );
}
