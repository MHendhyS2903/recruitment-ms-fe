import type { InfoPanelProps } from '../../types/dashboard';

function InfoPanel({ title, description, children }: InfoPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default InfoPanel;
