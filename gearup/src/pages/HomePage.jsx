import { Link } from "react-router-dom"
import {
  FaCar,
  FaTools,
  FaSearch,
  FaCalendarAlt,
  FaUserCog,
  FaShieldAlt,
} from "react-icons/fa"

const HomePage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center min-h-[600px] px-5 py-20 bg-gradient-to-br from-primary to-primary/80 text-center lg:text-left">
        <div className="flex-1 max-w-xl mb-10 lg:mb-0 lg:pr-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-5 text-primary-foreground leading-tight">
            Vehicle Repair Services Management
          </h1>
          <p className="text-lg mb-8 text-primary-foreground/90 leading-relaxed">
            Streamline your vehicle repair experience with our comprehensive management system. Book services, track
            repairs, and manage your vehicle maintenance all in one place.
          </p>
          <div className="flex gap-4 justify-center lg:justify-start">
            <Link to="/auth/register" className="px-6 py-3 rounded-md font-semibold text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all hover:-translate-y-0.5 border border-primary-foreground">
              Get Started
            </Link>
            <Link to="/auth/login" className="px-6 py-3 rounded-md font-semibold text-primary-foreground border-2 border-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img src="/repair.jpg" alt="Vehicle Repair" className="rounded-lg shadow-xl max-w-full h-auto" />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-5 py-20 bg-muted">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Our Services</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We offer a wide range of vehicle repair and maintenance services to keep your vehicle running smoothly.
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-card rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="text-4xl text-primary bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-5">
              <FaTools />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Maintenance Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              Regular maintenance services to keep your vehicle in optimal condition.
            </p>
          </div>
          <div className="bg-card rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="text-4xl text-primary bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-5">
              <FaCar />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Repair Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              Professional repair services for all types of vehicle issues.
            </p>
          </div>
          <div className="bg-card rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="text-4xl text-primary bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-5">
              <FaSearch />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Diagnostic Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              Advanced diagnostic services to identify and resolve vehicle problems.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-5 py-20 bg-background">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our platform makes it easy to manage your vehicle repair needs.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center border-b border-border mb-10">
            {["For Users", "For Garages", "For Workers", "For Admins"].map((label, idx) => (
              <button
                key={idx}
                className={`px-6 py-3 font-semibold transition-all relative ${
                  idx === 0 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground border-b-2 border-transparent hover:text-primary/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "1",
                title: "Find a Garage",
                desc: "Search for garages near you and view their services and ratings.",
              },
              {
                step: "2",
                title: "Book a Service",
                desc: "Select the service you need and schedule an appointment.",
              },
              {
                step: "3",
                title: "Track Progress",
                desc: "Monitor the status of your repair in real-time and receive notifications.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative bg-card rounded-xl p-8 shadow-md">
                <div className="absolute -top-5 left-6 w-10 h-10 bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center">
                  {step}
                </div>
                <h3 className="text-xl font-semibold mb-3 mt-6 text-card-foreground">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-5 py-20 bg-muted">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">What Our Customers Say</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Don't just take our word for it. Here's what our customers have to say.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-hide px-4 pb-4">
          {[
            {
              quote:
                "This platform has made managing my vehicle repairs so much easier. I can book services, track progress, and pay all in one place. Highly recommended!",
              author: "John Doe",
              role: "Vehicle Owner",
              img: "/images/avatar-1.jpg",
            },
            {
              quote:
                "As a garage manager, this system has streamlined our operations significantly. We can manage bookings, assign workers, and communicate with customers efficiently.",
              author: "Jane Smith",
              role: "Garage Manager",
              img: "/images/avatar-2.jpg",
            },
          ].map(({ quote, author, role, img }, idx) => (
            <div key={idx} className="min-w-[300px] bg-card rounded-xl p-6 shadow-md flex-shrink-0 hover:shadow-lg transition-all">
              <p className="italic text-card-foreground mb-6">{`"${quote}"`}</p>
              <div className="flex items-center">
                <img src={img} alt={author} className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                  <h4 className="font-semibold text-card-foreground">{author}</h4>
                  <p className="text-sm text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-5 py-20 bg-background">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              icon: <FaCalendarAlt />,
              title: "Easy Scheduling",
              desc: "Book appointments at your convenience with our easy-to-use scheduling system.",
            },
            {
              icon: <FaUserCog />,
              title: "Expert Mechanics",
              desc: "Our platform connects you with skilled and certified mechanics for quality service.",
            },
            {
              icon: <FaShieldAlt />,
              title: "Secure Payments",
              desc: "Enjoy peace of mind with our secure payment processing system.",
            },
          ].map(({ icon, title, desc }, idx) => (
            <div key={idx} className="text-center px-6 py-8 transition-transform hover:-translate-y-1">
              <div className="text-4xl text-primary mb-4 mx-auto">{icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 py-20 bg-gradient-to-br from-primary/90 to-primary text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Ready to Get Started?</h2>
          <p className="text-lg mb-8 leading-relaxed text-primary-foreground/90">
            Join our platform today and experience the future of vehicle repair management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth/register" className="px-6 py-3 rounded-md font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all hover:-translate-y-0.5">
              Sign Up Now
            </Link>
            <Link to="/garages" className="px-6 py-3 rounded-md font-semibold border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 transition-all hover:-translate-y-0.5">
              Find a Garage
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage