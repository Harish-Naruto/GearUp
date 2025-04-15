import { Link } from "react-router-dom"
import { FaCar, FaTools, FaSearch, FaCalendarAlt, FaUserCog, FaShieldAlt } from "react-icons/fa"
import "./HomePage.css"

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Vehicle Repair Services Management</h1>
          <p>
            Streamline your vehicle repair experience with our comprehensive management system. Book services, track
            repairs, and manage your vehicle maintenance all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/auth/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/auth/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/repair.jpg" alt="Vehicle Repair" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>We offer a wide range of vehicle repair and maintenance services to keep your vehicle running smoothly.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaTools />
            </div>
            <h3>Maintenance Services</h3>
            <p>Regular maintenance services to keep your vehicle in optimal condition.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaCar />
            </div>
            <p>Professional repair services for all types of vehicle issues.</p>
            <h3>Repair Services</h3>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaSearch />
            </div>
            <h3>Diagnostic Services</h3>
            <p>Advanced diagnostic services to identify and resolve vehicle problems.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Our platform makes it easy to manage your vehicle repair needs.</p>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button className="tab active" data-tab="user">
              For Users
            </button>
            <button className="tab" data-tab="garage">
              For Garages
            </button>
            <button className="tab" data-tab="worker">
              For Workers
            </button>
            <button className="tab" data-tab="admin">
              For Admins
            </button>
          </div>

          <div className="tab-content active" id="user-tab">
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Find a Garage</h3>
                <p>Search for garages near you and view their services and ratings.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Book a Service</h3>
                <p>Select the service you need and schedule an appointment.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Track Progress</h3>
                <p>Monitor the status of your repair in real-time and receive notifications.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Don't just take our word for it. Here's what our customers have to say.</p>
        </div>

        <div className="testimonials-slider">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "This platform has made managing my vehicle repairs so much easier. I can book services, track progress,
                and pay all in one place. Highly recommended!"
              </p>
            </div>
            <div className="testimonial-author">
              <img src="/images/avatar-1.jpg" alt="John Doe" />
              <div>
                <h4>John Doe</h4>
                <p>Vehicle Owner</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "As a garage manager, this system has streamlined our operations significantly. We can manage bookings,
                assign workers, and communicate with customers efficiently."
              </p>
            </div>
            <div className="testimonial-author">
              <img src="/images/avatar-2.jpg" alt="Jane Smith" />
              <div>
                <h4>Jane Smith</h4>
                <p>Garage Manager</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaCalendarAlt />
            </div>
            <h3>Easy Scheduling</h3>
            <p>Book appointments at your convenience with our easy-to-use scheduling system.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaUserCog />
            </div>
            <h3>Expert Mechanics</h3>
            <p>Our platform connects you with skilled and certified mechanics for quality service.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <FaShieldAlt />
            </div>
            <h3>Secure Payments</h3>
            <p>Enjoy peace of mind with our secure payment processing system.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join our platform today and experience the future of vehicle repair management.</p>
          <div className="cta-buttons">
            <Link to="/auth/register" className="btn btn-primary">
              Sign Up Now
            </Link>
            <Link to="/garages" className="btn btn-secondary">
              Find a Garage
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
