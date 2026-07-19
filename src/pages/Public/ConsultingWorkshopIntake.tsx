/**
 * Consulting Workshop - Window 1: Discovery Intake
 * Multi-window onboarding workflow for consulting workshop signup
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';
import { Check, ArrowRight } from 'lucide-react';
import styles from './ConsultingWorkshopIntake.module.css';

const meta = ROUTE_META['/consulting-workshop/intake'];

export default function ConsultingWorkshopIntake() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    companyName: '',
    companyWebsite: '',
    companyEmail: '',
    productObjective: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.title.trim()) newErrors.title = 'Required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Required';
    if (!formData.companyWebsite.trim()) newErrors.companyWebsite = 'Required';
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Invalid email';
    }
    if (!formData.productObjective.trim()) newErrors.productObjective = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Store form data in sessionStorage for Window 2
    sessionStorage.setItem('consultingWorkshopIntake', JSON.stringify(formData));
    
    // Navigate to Window 2
    setTimeout(() => {
      navigate('/consulting-workshop/payment');
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Value Proposition */}
          <div className={styles.leftColumn}>
            <div className={styles.header}>
              <h1 className={styles.title}>Product & Architecture Discovery Consulting Workshop</h1>
              <p className={styles.subtitle}>Build on Ironclad Foundations.</p>
            </div>

            <div className={styles.description}>
              <p>
                Building complex software without verified technical boundaries is the single most expensive mistake a technology company can make. Fragile microservice splits, bottlenecked data pipelines, or blind spots in scaling systems lead to heavy engineering debt, team friction, and months of delayed shipping.
              </p>
              <p>
                This elite, high-touch architectural intervention completely de-risks your foundation, aligning your product vision with production-ready engineering frameworks before you deploy capital into full-scale development.
              </p>
            </div>

            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <Check className={styles.checkIcon} size={20} />
                <span>Eliminate Architectural Bottlenecks: Lock down precise structural lines and data flows.</span>
              </div>
              <div className={styles.benefit}>
                <Check className={styles.checkIcon} size={20} />
                <span>Maximize Developer Velocity: Prevent code thrash by giving your team absolute clarity.</span>
              </div>
              <div className={styles.benefit}>
                <Check className={styles.checkIcon} size={20} />
                <span>Protect Capital: Turn abstract goals into an immutable, execution-ready engineering strategy.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Intake Form */}
          <div className={styles.rightColumn}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Executive Intake Form</h2>
              <p className={styles.formSubtitle}>
                Please provide your basic organization details to initialize the workspace configuration.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Full Name & Professional Title</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe, CTO"
                    className={errors.fullName ? styles.inputError : ''}
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="title">Professional Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Chief Technology Officer"
                    className={errors.title ? styles.inputError : ''}
                  />
                  {errors.title && <span className={styles.errorText}>{errors.title}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className={errors.companyName ? styles.inputError : ''}
                  />
                  {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="companyWebsite">Company Website</label>
                  <input
                    type="text"
                    id="companyWebsite"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://acme.com"
                    className={errors.companyWebsite ? styles.inputError : ''}
                  />
                  {errors.companyWebsite && <span className={styles.errorText}>{errors.companyWebsite}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="companyEmail">Company Email</label>
                  <input
                    type="email"
                    id="companyEmail"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    placeholder="john@acme.com"
                    className={errors.companyEmail ? styles.inputError : ''}
                  />
                  {errors.companyEmail && <span className={styles.errorText}>{errors.companyEmail}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productObjective">Primary Product Objective</label>
                  <textarea
                    id="productObjective"
                    name="productObjective"
                    value={formData.productObjective}
                    onChange={handleChange}
                    placeholder="What is the primary product or feature set you are building or scaling?"
                    rows={4}
                    className={errors.productObjective ? styles.inputError : ''}
                  />
                  {errors.productObjective && <span className={styles.errorText}>{errors.productObjective}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Scheduling Calendar</label>
                  <div className={styles.calendarPlaceholder}>
                    <p className={styles.calendarText}>
                      Calendar scheduling will be available after payment completion
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
