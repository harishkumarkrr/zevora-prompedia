import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const LegalPage = () => {
  const { type } = useParams<{ type: 'privacy' | 'terms' | 'refunds' }>();

  const content = {
    privacy: {
      title: 'Privacy Policy',
      body: (
        <div className="space-y-4 text-text-muted">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">1. Information We Collect</h3>
          <p>We collect information you provide directly to us when you create an account, submit prompts, or communicate with us. This may include your name, email address, and any content you submit.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">2. How We Use Your Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience on Zevora.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">3. Information Sharing</h3>
          <p>We do not share your personal information with third parties except as described in this privacy policy or with your consent. Prompts you submit as "public" will be visible to all users.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">4. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at support@zevora.xyz.</p>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      body: (
        <div className="space-y-4 text-text-muted">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">1. Acceptance of Terms</h3>
          <p>By accessing or using Zevora, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">2. User Content</h3>
          <p>You retain all rights to the prompts you submit. By submitting public prompts, you grant Zevora a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content within the platform.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">3. Acceptable Use</h3>
          <p>You agree not to use the service to submit malicious, illegal, or highly offensive content. We reserve the right to remove any content or terminate accounts that violate these terms.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">4. Disclaimer</h3>
          <p>The materials on Zevora are provided on an 'as is' basis. Zevora makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
        </div>
      )
    },
    refunds: {
      title: 'Refund Policy',
      body: (
        <div className="space-y-4 text-text-muted">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">1. Refund Eligibility</h3>
          <p>We want you to be satisfied with your Zevora Pro subscription. If you are not completely satisfied, you may request a refund within 14 days of your initial purchase.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">2. How to Request a Refund</h3>
          <p>To request a refund, please contact us at support@zevora.xyz with your account email and the reason for your request. We process refund requests within 5-7 business days.</p>
          <h3 className="text-lg font-bold text-text mt-6 mb-2">3. Exceptions</h3>
          <p>Refunds are generally not provided for renewal payments or after the 14-day window has passed. Accounts terminated for violating our Terms of Service are not eligible for refunds.</p>
        </div>
      )
    }
  };

  const page = type ? content[type] : null;

  if (!page) return <div>Page not found</div>;

  return (
    <div className="min-h-screen bg-bg p-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-accent hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-4xl font-display font-bold mb-8">{page.title}</h1>
        {page.body}
      </div>
    </div>
  );
};
