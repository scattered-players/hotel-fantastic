import React from 'react';

import './theprogram.scss';

class TheProgram extends React.Component {

  render() {
    return (
      <div className="theprogram-component">
        <section>
          <h2>Our Artists</h2>
          <hr />
          <div className="actor">
            <div className="headshot">
              <img src="https://i1.wp.com/decider.com/wp-content/uploads/2019/05/one-punch-man-season-2-episode-6.jpg" />
            </div>
            <div className="info">
              <h3>
                Your Name Here
              </h3>
              <h4>
                Director
              </h4>
              <p><a className="insta-link" href="https://www.instagram.com/"><img src="/media/icons/instagram-logo.png" alt="Instagram Logo" /></a></p>
              <p>
                You can do it!
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

TheProgram.displayName = 'TheProgram';
TheProgram.propTypes = {};
TheProgram.defaultProps = {};

export default TheProgram;
