import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Fleet Manager. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
