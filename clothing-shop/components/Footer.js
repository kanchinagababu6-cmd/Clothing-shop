import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111827', color: '#d1d5db', padding: '40px 20px 20px', marginTop: '60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '30px' }}>
        
        {/* Brand */}
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '10px' }}>THREADLY</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#9ca3af' }}>
            Everyday clothes, simply. Comfortable, quality fashion essentials.
          </p>
        </div>

        {/* Policies */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '10px' }}>Customer Care</h4>
          <p style={{ fontSize: '14px', margin: '6px 0' }}>
            <Link href="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              Terms & Conditions
            </Link>
          </p>
        </div>

        {/* Contact Info */}
        <div style={{ flex: '1 1 250px' }}>
          <h4 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '10px' }}>Contact Details</h4>
          <p style={{ fontSize: '14px', margin: '6px 0', color: '#9ca3af' }}>
            <strong style={{ color: '#fff' }}>Phone: </strong> 
            <a href="tel:+919876543210" style={{ color: '#60a5fa' }}>+91 98765 43210</a>
          </p>
          <p style={{ fontSize: '14px', margin: '6px 0', color: '#9ca3af' }}>
            <strong style={{ color: '#fff' }}>Email: </strong> 
            <a href="mailto:kanchinagababu6@gmail.com" style={{ color: '#60a5fa' }}>kanchinagababu6@gmail.com</a>
          </p>
          <p style={{ fontSize: '14px', margin: '6px 0', color: '#9ca3af' }}>
            <strong style={{ color: '#fff' }}>Location: </strong> India
          </p>
        </div>

      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid #374151', marginTop: '30px', paddingTop: '20px', fontSize: '12px', color: '#6b7280' }}>
        &copy; {new Date().getFullYear()} Threadly. All rights reserved.
      </div>
    </footer>
  );
}
