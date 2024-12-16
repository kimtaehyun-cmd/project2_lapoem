import React from 'react';
import './PageHeader.css';

function PageHeader({ title, description, step_title, steps = [], active_step, is_required, error_message }) {
  return (
    <div className="page_header">
      <h2 className="page_title">{title}</h2>
      {description && <p className="page_description">{description}</p>}
      {error_message && <p className="error_message">{error_message}</p>}
      <hr className="page_divider" />
      <div className="page_navigation">
        <div className="left_side">
          <span className="page_step_title">{step_title}</span>
          {is_required && <span className="required_text"> * 필수항목</span>}
        </div>
        <div className="right_side page_steps">
          {steps.map((step, index) => (
            <span key={index} className={`step_text ${index === active_step ? 'active_step' : ''}`}>
              {step}
              {index < steps.length - 1 && ' > '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
