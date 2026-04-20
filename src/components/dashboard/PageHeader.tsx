import type { PageHeaderProps } from '../../types/dashboard';

function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-copy">{description}</p>
      </div>
      {action}
    </section>
  );
}

export default PageHeader;
