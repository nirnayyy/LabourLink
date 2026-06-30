import React from 'react';
import { NavLink } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <h4>LabourLink</h4>
            <p>Connecting you with trusted daily-wage workers in Greater Noida.</p>
            <p style={{marginTop:'12px', fontSize:'.9rem'}}>An initiative by SuperKalam.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <NavLink to="/browse">Browse Workers</NavLink>
            <NavLink to="/post-job">Post a Job</NavLink>
            <NavLink to="/reviews">Reviews</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/login">Login</NavLink>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} LabourLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
