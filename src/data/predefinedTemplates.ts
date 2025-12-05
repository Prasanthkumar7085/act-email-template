export const PREDEFINED_TEMPLATES: Array<{
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  data: any;
}> = [
  {
    id: "corporate-newsletter",
    title: "Corporate Newsletter",
    description:
      "Professional corporate update with multiple sections and columns",
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c43?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          id: "header-main",
          type: "header",
          data: {
            text: "Quarterly Business Update",
            level: 1,
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "intro-paragraph",
          type: "paragraph",
          data: {
            text: "Dear Team,<br><br>We're excited to share our Q3 achievements and upcoming initiatives. This quarter has been marked by significant growth and new opportunities that position us for continued success.",
          },
        },
        {
          id: "delimiter-1",
          type: "delimiter",
          data: {},
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "columns-stats",
          type: "columns",
          data: {
            numberOfColumns: 3,
            cols: [
              {
                blocks: [
                  {
                    id: "stat-1",
                    type: "paragraph",
                    data: {
                      text: "<strong>25%</strong><br>Revenue Growth",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "stat-2",
                    type: "paragraph",
                    data: {
                      text: "<strong>99.8%</strong><br>Customer Satisfaction",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "stat-3",
                    type: "paragraph",
                    data: {
                      text: "<strong>15</strong><br>New Team Members",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 20,
              backgroundColor: "#f8fafc",
              columnBackgroundColor: "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: 12,
              padding: 20,
            },
          },
        },
        {
          id: "achievements-header",
          type: "header",
          data: {
            text: "🎯 Key Achievements",
            level: 2,
          },
        },
        {
          id: "achievements-list",
          type: "list",
          data: {
            style: "unordered",
            items: [
              "Revenue growth of 25% compared to last quarter",
              "Successful launch of 3 new product features",
              "Expanded team with 15 new talented members",
              "Achieved 99.8% customer satisfaction rate",
              "Expanded into 3 new international markets",
            ],
          },
        },
        {
          id: "metrics-header",
          type: "header",
          data: {
            text: "📊 Performance Metrics",
            level: 2,
          },
        },
        {
          id: "metrics-table",
          type: "table",
          data: {
            withHeadings: true,
            content: [
              ["Metric", "Current", "Previous", "Growth"],
              ["Revenue", "$4.2M", "$3.4M", "+23.5%"],
              ["Users", "45,200", "38,500", "+17.4%"],
              ["Engagement", "4.2/5", "3.9/5", "+7.7%"],
              ["Retention", "92%", "88%", "+4.5%"],
            ],
          },
        },
        {
          id: "cta-button",
          type: "button",
          data: {
            text: "View Detailed Report",
            url: "https://example.com/q3-report",
            style: "filled",
            color: "#ffffff",
            backgroundColor: "#3b82f6",
            align: "center",
            target: "_blank",
            size: "medium",
          },
        },
      ],
      version: "2.31.0",
    },
  },
  {
    id: "product-launch",
    title: "Product Launch",
    description: "Exciting new product announcement with features and columns",
    thumbnail:
      "https://images.unsplash.com/photo-1556656882-b5ff6c4e14b1?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          id: "main-header",
          type: "header",
          data: {
            text: "🚀 Introducing Our New Platform",
            level: 1,
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "intro-paragraph",
          type: "paragraph",
          data: {
            text: "We're thrilled to announce the launch of our revolutionary new platform designed to transform your workflow and boost productivity across your organization.",
          },
        },
        {
          id: "product-image",
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600",
            },
            caption: "New Platform Interface - Clean, intuitive, and powerful",
            withBorder: false,
            stretched: true,
          },
        },
        {
          id: "features-columns",
          type: "columns",
          data: {
            numberOfColumns: 2,
            cols: [
              {
                blocks: [
                  {
                    id: "feature-1",
                    type: "header",
                    data: {
                      text: "✨ AI-Powered Automation",
                      level: 3,
                    },
                  },
                  {
                    id: "feature-1-desc",
                    type: "paragraph",
                    data: {
                      text: "Save 10+ hours weekly with intelligent automation that learns your workflow patterns.",
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "feature-2",
                    type: "header",
                    data: {
                      text: "🤝 Real-Time Collaboration",
                      level: 3,
                    },
                  },
                  {
                    id: "feature-2-desc",
                    type: "paragraph",
                    data: {
                      text: "Work seamlessly with team members across different time zones and locations.",
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 30,
              backgroundColor: "#f0f9ff",
              columnBackgroundColor: "#ffffff",
              borderColor: "#bae6fd",
              borderRadius: 8,
              padding: 25,
            },
          },
        },
        {
          id: "testimonial-quote",
          type: "quote",
          data: {
            text: "This platform has completely transformed how our team works together. The efficiency gains are incredible and the user experience is second to none!",
            caption: "Sarah Chen, Early Beta User & Product Director",
            alignment: "center",
          },
        },
        {
          id: "horizontal-line",
          type: "horizontalLine",
          data: {
            style: "dashed",
            thickness: 2,
            color: "#3b82f6",
            alignment: "center",
          },
        },
        {
          id: "cta-section",
          type: "columns",
          data: {
            numberOfColumns: 2,
            cols: [
              {
                blocks: [
                  {
                    id: "cta-text",
                    type: "paragraph",
                    data: {
                      text: "<strong>Ready to transform your workflow?</strong><br>Start your free trial today with full access to all features.",
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "cta-button",
                    type: "button",
                    data: {
                      text: "Start Free Trial",
                      url: "https://example.com/free-trial",
                      style: "filled",
                      color: "#ffffff",
                      backgroundColor: "#10b981",
                      align: "center",
                      size: "large",
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 20,
              backgroundColor: "#ecfdf5",
              columnBackgroundColor: "transparent",
              borderRadius: 12,
              padding: 20,
            },
          },
        },
      ],
      version: "2.31.0",
    },
  },
  {
    id: "event-invitation",
    title: "Event Invitation",
    description: "Elegant event invitation with details, RSVP, and columns",
    thumbnail:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          id: "main-header",
          type: "header",
          data: {
            text: "📅 You're Invited: Annual Tech Summit 2024",
            level: 1,
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "intro-paragraph",
          type: "paragraph",
          data: {
            text: "Join industry leaders and innovators for an unforgettable experience at our flagship technology conference. Network, learn, and discover the future of technology.",
          },
        },
        {
          id: "event-image",
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
            },
            caption:
              "Tech Summit 2023 Highlights - Join us for an even bigger 2024!",
            withBorder: true,
            stretched: false,
          },
        },
        {
          id: "details-columns",
          type: "columns",
          data: {
            numberOfColumns: 2,
            cols: [
              {
                blocks: [
                  {
                    id: "details-header",
                    type: "header",
                    data: {
                      text: "Event Details",
                      level: 2,
                    },
                  },
                  {
                    id: "details-list",
                    type: "list",
                    data: {
                      style: "unordered",
                      items: [
                        "📅 <strong>Date:</strong> November 15-17, 2024",
                        "⏰ <strong>Time:</strong> 9:00 AM - 6:00 PM Daily",
                        "📍 <strong>Location:</strong> Convention Center, San Francisco",
                        "🎟️ <strong>Early Bird:</strong> Available until October 30",
                      ],
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "highlights-header",
                    type: "header",
                    data: {
                      text: "Event Highlights",
                      level: 2,
                    },
                  },
                  {
                    id: "highlights-list",
                    type: "list",
                    data: {
                      style: "unordered",
                      items: [
                        "🎤 Keynote presentations from industry pioneers",
                        "💡 Hands-on workshops and training sessions",
                        "🤝 Networking events with 1000+ professionals",
                        "🏆 Innovation awards and startup showcase",
                      ],
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 40,
              backgroundColor: "#fef7ff",
              columnBackgroundColor: "#ffffff",
              borderColor: "#e9d5ff",
              borderRadius: 12,
              padding: 25,
            },
          },
        },
        {
          id: "speakers-header",
          type: "header",
          data: {
            text: "🎤 Featured Speakers",
            level: 2,
          },
        },
        {
          id: "speakers-columns",
          type: "columns",
          data: {
            numberOfColumns: 2,
            cols: [
              {
                blocks: [
                  {
                    id: "speaker-1",
                    type: "paragraph",
                    data: {
                      text: "<strong>Dr. Maria Rodriguez</strong><br>AI Research Director<br><em>Google Research</em>",
                    },
                  },
                  {
                    id: "speaker-2",
                    type: "paragraph",
                    data: {
                      text: "<strong>James Kim</strong><br>Startup Founder & Investor<br><em>Tech Ventures Capital</em>",
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "speaker-3",
                    type: "paragraph",
                    data: {
                      text: "<strong>Lisa Thompson</strong><br>Digital Transformation Expert<br><em>Microsoft</em>",
                    },
                  },
                  {
                    id: "speaker-4",
                    type: "paragraph",
                    data: {
                      text: "<strong>David Park</strong><br>Cybersecurity Authority<br><em>NSA Cybersecurity</em>",
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 20,
              backgroundColor: "transparent",
              columnBackgroundColor: "#f8fafc",
              borderRadius: 8,
              padding: 20,
            },
          },
        },
        {
          id: "delimiter",
          type: "delimiter",
          data: {},
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "rsvp-button",
          type: "button",
          data: {
            text: "RSVP Now - Limited Seats!",
            url: "https://example.com/rsvp-tech-summit",
            style: "filled",
            color: "#ffffff",
            backgroundColor: "#8b5cf6",
            align: "center",
            size: "large",
          },
        },
        {
          id: "footer-note",
          type: "paragraph",
          data: {
            text: "<em>Early bird pricing available until October 30th. Group discounts for teams of 5+ available.</em>",
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
      ],
      version: "2.31.0",
    },
  },
  {
    id: "marketing-promo",
    title: "Marketing Promotion",
    description: "Eye-catching promotional campaign with pricing columns",
    thumbnail:
      "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          id: "main-header",
          type: "header",
          data: {
            text: "🎉 Flash Sale - 48 Hours Only!",
            level: 1,
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "intro-paragraph",
          type: "paragraph",
          data: {
            text: "Don't miss our biggest sale of the year! For the next 48 hours, enjoy incredible discounts across all premium plans. Upgrade now and save big!",
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "sale-image",
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=600",
            },
            caption: "Limited Time Offer - Act Fast!",
            withBorder: false,
            stretched: true,
          },
        },
        {
          id: "pricing-columns",
          type: "columns",
          data: {
            numberOfColumns: 3,
            cols: [
              {
                blocks: [
                  {
                    id: "plan-starter",
                    type: "header",
                    data: {
                      text: "Starter",
                      level: 3,
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "price-starter",
                    type: "paragraph",
                    data: {
                      text: "<strong>$14.50</strong><br><small>/month</small>",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "features-starter",
                    type: "list",
                    data: {
                      style: "unordered",
                      items: [
                        "Up to 5 users",
                        "10GB storage",
                        "Basic analytics",
                        "Email support",
                      ],
                    },
                  },
                  {
                    id: "button-starter",
                    type: "button",
                    data: {
                      text: "Get Started",
                      url: "https://example.com/starter-plan",
                      style: "outline",
                      color: "#3b82f6",
                      backgroundColor: "transparent",
                      align: "center",
                      size: "medium",
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "plan-pro",
                    type: "header",
                    data: {
                      text: "Professional",
                      level: 3,
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "price-pro",
                    type: "paragraph",
                    data: {
                      text: "<strong style='color: #10b981'>$39.50</strong><br><small>/month</small><br><span style='color: #10b981'>Most Popular</span>",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "features-pro",
                    type: "list",
                    data: {
                      style: "unordered",
                      items: [
                        "Up to 25 users",
                        "100GB storage",
                        "Advanced analytics",
                        "Priority support",
                        "API access",
                      ],
                    },
                  },
                  {
                    id: "button-pro",
                    type: "button",
                    data: {
                      text: "Get Professional",
                      url: "https://example.com/pro-plan",
                      style: "filled",
                      color: "#ffffff",
                      backgroundColor: "#10b981",
                      align: "center",
                      size: "medium",
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "plan-enterprise",
                    type: "header",
                    data: {
                      text: "Enterprise",
                      level: 3,
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "price-enterprise",
                    type: "paragraph",
                    data: {
                      text: "<strong>$99.50</strong><br><small>/month</small>",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "features-enterprise",
                    type: "list",
                    data: {
                      style: "unordered",
                      items: [
                        "Unlimited users",
                        "1TB storage",
                        "Custom analytics",
                        "24/7 dedicated support",
                        "Custom integrations",
                        "SLA guarantee",
                      ],
                    },
                  },
                  {
                    id: "button-enterprise",
                    type: "button",
                    data: {
                      text: "Contact Sales",
                      url: "https://example.com/enterprise-plan",
                      style: "outline",
                      color: "#8b5cf6",
                      backgroundColor: "transparent",
                      align: "center",
                      size: "medium",
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 20,
              backgroundColor: "transparent",
              columnBackgroundColor: "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: 12,
              padding: 15,
            },
          },
        },
        {
          id: "coupon-code",
          type: "paragraph",
          data: {
            text: "<strong>Use code:</strong> <code style='background: #f1f5f9; padding: 4px 8px; border-radius: 4px;'>FLASH50</code> at checkout for an additional 10% off!",
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "horizontal-line",
          type: "horizontalLine",
          data: {
            style: "solid",
            thickness: 3,
            color: "#f59e0b",
            alignment: "center",
          },
        },
        {
          id: "urgency-note",
          type: "paragraph",
          data: {
            text: "⏰ <strong>Hurry!</strong> This special pricing is available for new customers only and ends on Friday at midnight. Don't miss out on these incredible savings!",
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
      ],
      version: "2.31.0",
    },
  },
  {
    id: "company-update",
    title: "Company Update",
    description: "Important company news with multi-column layout",
    thumbnail:
      "https://images.unsplash.com/photo-1565689228644-83e87bb6a5e1?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          id: "main-header",
          type: "header",
          data: {
            text: "🏢 Important Company Announcement",
            level: 1,
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "intro-paragraph",
          type: "paragraph",
          data: {
            text: "Dear Valued Customers and Partners,<br><br>We have some exciting news to share about our company's growth and future direction. These changes reflect our commitment to innovation and excellence.",
          },
        },
        {
          id: "changes-columns",
          type: "columns",
          data: {
            numberOfColumns: 2,
            cols: [
              {
                blocks: [
                  {
                    id: "whats-changing",
                    type: "header",
                    data: {
                      text: "What's New",
                      level: 2,
                    },
                  },
                  {
                    id: "changes-list",
                    type: "list",
                    data: {
                      style: "unordered",
                      items: [
                        "🏛️ New headquarters opening in Austin, TX",
                        "🌍 Expanded customer support (now 24/7 global)",
                        "🔒 Enhanced security features across all products",
                        "👥 New leadership appointments in key departments",
                        "🚀 $25M Series B funding secured for expansion",
                      ],
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "whats-same",
                    type: "header",
                    data: {
                      text: "What Stays the Same",
                      level: 2,
                    },
                  },
                  {
                    id: "same-list",
                    type: "list",
                    data: {
                      style: "unordered",
                      items: [
                        "Our commitment to customer satisfaction",
                        "Current pricing for existing customers",
                        "Product quality and reliability standards",
                        "Our dedication to innovation and excellence",
                        "Your trusted point of contact",
                      ],
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 40,
              backgroundColor: "#f0fdf4",
              columnBackgroundColor: "#ffffff",
              borderColor: "#bbf7d0",
              borderRadius: 12,
              padding: 30,
            },
          },
        },
        {
          id: "company-image",
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
            },
            caption:
              "Our new headquarters building in Austin, TX - Opening Q1 2024",
            withBorder: true,
            stretched: false,
          },
        },
        {
          id: "impact-columns",
          type: "columns",
          data: {
            numberOfColumns: 3,
            cols: [
              {
                blocks: [
                  {
                    id: "impact-1",
                    type: "paragraph",
                    data: {
                      text: "<strong>Faster Response Times</strong><br>24/7 global support means faster help when you need it.",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "impact-2",
                    type: "paragraph",
                    data: {
                      text: "<strong>Enhanced Security</strong><br>Enterprise-grade security for all customer tiers.",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "impact-3",
                    type: "paragraph",
                    data: {
                      text: "<strong>More Innovation</strong><br>Increased R&D budget for new features.",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 20,
              backgroundColor: "#f8fafc",
              columnBackgroundColor: "#ffffff",
              borderRadius: 8,
              padding: 20,
            },
          },
        },
        {
          id: "closing-paragraph",
          type: "paragraph",
          data: {
            text: "We're committed to providing even better service and innovation as we continue to grow. Thank you for being part of our journey and for your continued trust in our products and services.",
          },
        },
        {
          id: "learn-more-button",
          type: "button",
          data: {
            text: "Read Full Announcement",
            url: "https://example.com/company-update",
            style: "filled",
            color: "#ffffff",
            backgroundColor: "#6366f1",
            align: "center",
            size: "medium",
          },
        },
        {
          id: "delimiter-end",
          type: "delimiter",
          data: {},
          tunes: {
            alignment: { alignment: "center" },
          },
        },
      ],
      version: "2.31.0",
    },
  },
  {
    id: "service-showcase",
    title: "Service Showcase",
    description: "Professional service presentation with feature columns",
    thumbnail:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          id: "main-header",
          type: "header",
          data: {
            text: "💼 Our Premium Services",
            level: 1,
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "intro-paragraph",
          type: "paragraph",
          data: {
            text: "Discover how our comprehensive suite of services can transform your business operations and drive measurable results.",
          },
          tunes: {
            alignment: { alignment: "center" },
          },
        },
        {
          id: "services-columns",
          type: "columns",
          data: {
            numberOfColumns: 3,
            cols: [
              {
                blocks: [
                  {
                    id: "service-1",
                    type: "header",
                    data: {
                      text: "🛠️ Implementation",
                      level: 3,
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "service-1-desc",
                    type: "paragraph",
                    data: {
                      text: "Seamless integration and setup with expert guidance and best practices implementation.",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "service-2",
                    type: "header",
                    data: {
                      text: "🎯 Optimization",
                      level: 3,
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "service-2-desc",
                    type: "paragraph",
                    data: {
                      text: "Performance tuning and workflow optimization to maximize efficiency and ROI.",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "service-3",
                    type: "header",
                    data: {
                      text: "🚀 Growth",
                      level: 3,
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                  {
                    id: "service-3-desc",
                    type: "paragraph",
                    data: {
                      text: "Strategic planning and execution to scale your operations and accelerate growth.",
                    },
                    tunes: {
                      alignment: { alignment: "center" },
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 25,
              backgroundColor: "#fef7ff",
              columnBackgroundColor: "#ffffff",
              borderColor: "#e9d5ff",
              borderRadius: 12,
              padding: 25,
            },
          },
        },
        {
          id: "horizontal-line",
          type: "horizontalLine",
          data: {
            style: "dotted",
            thickness: 2,
            color: "#8b5cf6",
            alignment: "center",
          },
        },
        {
          id: "results-header",
          type: "header",
          data: {
            text: "📈 Client Success Stories",
            level: 2,
          },
        },
        {
          id: "results-columns",
          type: "columns",
          data: {
            numberOfColumns: 2,
            cols: [
              {
                blocks: [
                  {
                    id: "testimonial-1",
                    type: "quote",
                    data: {
                      text: "The implementation service transformed our workflow. We saw a 40% increase in productivity within the first month!",
                      caption: "Michael Chen, Operations Director",
                      alignment: "left",
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "testimonial-2",
                    type: "quote",
                    data: {
                      text: "Their optimization strategies helped us reduce operational costs by 25% while improving service quality significantly.",
                      caption: "Sarah Johnson, CEO",
                      alignment: "left",
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 30,
              backgroundColor: "transparent",
              columnBackgroundColor: "#f8fafc",
              borderRadius: 8,
              padding: 20,
            },
          },
        },
        {
          id: "cta-section",
          type: "columns",
          data: {
            numberOfColumns: 2,
            cols: [
              {
                blocks: [
                  {
                    id: "cta-text",
                    type: "paragraph",
                    data: {
                      text: "<strong>Ready to transform your business?</strong><br>Schedule a free consultation with our experts today.",
                    },
                  },
                ],
              },
              {
                blocks: [
                  {
                    id: "cta-buttons",
                    type: "paragraph",
                    data: {
                      text: "",
                    },
                  },
                  {
                    id: "consult-button",
                    type: "button",
                    data: {
                      text: "Book Consultation",
                      url: "https://example.com/consultation",
                      style: "filled",
                      color: "#ffffff",
                      backgroundColor: "#8b5cf6",
                      align: "center",
                      size: "medium",
                    },
                  },
                ],
              },
            ],
            layout: {
              gap: 20,
              backgroundColor: "#faf5ff",
              columnBackgroundColor: "transparent",
              borderRadius: 12,
              padding: 25,
            },
          },
        },
      ],
      version: "2.31.0",
    },
  },
];

export default PREDEFINED_TEMPLATES;
