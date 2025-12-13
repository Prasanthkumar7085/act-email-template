// Predefined templates
export const PREDEFINED_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Perfect for welcoming new subscribers",
    icon: "👋",
    elements: [
      {
        id: "heading-survey-001",
        type: "heading",
        content: "We Value Your Feedback",
        level: 1,
        styles: {
          fontSize: "32px",
          fontWeight: "bold",
          color: "#1f2937",
          textAlign: "center",
          margin: "0 0 16px 0",
        },
      },
      {
        id: "paragraph-survey-002",
        type: "paragraph",
        content:
          "Help us improve by sharing your experience. It only takes 2 minutes!",
        styles: {
          fontSize: "16px",
          color: "#6b7280",
          textAlign: "center",
          margin: "0 0 32px 0",
        },
      },
      {
        id: "list-survey-003",
        type: "list",
        items: [
          "Your feedback helps us serve you better",
          "Anonymous and confidential",
          "Direct impact on future improvements",
        ],
        styles: {
          margin: "0 0 32px 0",
          padding: "0 0 0 24px",
        },
      },
      {
        id: "button-survey-004",
        type: "button",
        content: "Take Our Survey",
        styles: {
          backgroundColor: "#8b5cf6",
          color: "#ffffff",
          padding: "16px 32px",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "600",
          margin: "0 auto 32px auto",
          display: "block",
          width: "fit-content",
        },
      },
      {
        id: "div-survey-005",
        type: "div",
        children: [
          {
            id: "heading-survey-006",
            type: "heading",
            content: "As a thank you...",
            level: 3,
            styles: {
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              margin: "0 0 8px 0",
              textAlign: "center",
            },
          },
          {
            id: "paragraph-survey-007",
            type: "paragraph",
            content: "Complete the survey and get 15% off your next purchase!",
            styles: {
              fontSize: "16px",
              color: "#10b981",
              textAlign: "center",
              margin: "0",
              fontWeight: "600",
            },
          },
        ],
        styles: {
          padding: "24px",
          backgroundColor: "#f0fdf4",
          borderRadius: "8px",
          margin: "0 0 24px 0",
          border: "1px solid #bbf7d0",
        },
      },
    ],
  },

  {
    id: "welcome2",
    name: "Welcome Email",
    description: "Perfect for welcoming new subscribers",
    icon: "👋",
    elements: [
      {
        id: "header-welcome-001",
        type: "heading",
        content: "Welcome to Our Community!",
        level: 1,
        styles: {
          fontSize: "32px",
          fontWeight: "bold",
          color: "#1f2937",
          textAlign: "center",
          margin: "0 0 16px 0",
          lineHeight: "1.2",
        },
      },
      {
        id: "paragraph-welcome-002",
        type: "paragraph",
        content:
          "We're thrilled to have you join us. Get ready for exclusive content, special offers, and valuable insights delivered right to your inbox.",
        styles: {
          fontSize: "16px",
          color: "#6b7280",
          textAlign: "center",
          margin: "0 0 32px 0",
          lineHeight: "1.6",
        },
      },
      {
        id: "button-welcome-003",
        type: "button",
        content: "Get Started",
        styles: {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          padding: "16px 32px",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "600",
          margin: "0 auto 32px auto",
          display: "block",
          width: "fit-content",
        },
      },
      {
        id: "divider-welcome-004",
        type: "divider",
        styles: {
          height: "2px",
          backgroundColor: "#e5e7eb",
          margin: "32px 0",
          border: "none",
        },
      },
      {
        id: "heading-welcome-005",
        type: "heading",
        content: "What to Expect",
        level: 2,
        styles: {
          fontSize: "24px",
          fontWeight: "bold",
          color: "#1f2937",
          margin: "0 0 16px 0",
          textAlign: "left",
        },
      },
      {
        id: "list-welcome-006",
        type: "list",
        items: [
          "Weekly newsletters with industry insights",
          "Exclusive member discounts",
          "Early access to new features",
          "Helpful tutorials and guides",
        ],
        styles: {
          margin: "0 0 32px 0",
          padding: "0 0 0 24px",
        },
      },
    ],
  },

  {
    id: "welcome3",
    name: "Welcome Email",
    description: "Perfect for welcoming new subscribers",
    icon: "👋",
    elements: [
      {
        id: "div-newsletter-001",
        type: "div",
        children: [
          {
            id: "heading-newsletter-002",
            type: "heading",
            content: "Monthly Insights: December 2023",
            level: 1,
            styles: {
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1f2937",
              textAlign: "center",
              margin: "0 0 8px 0",
            },
          },
          {
            id: "paragraph-newsletter-003",
            type: "paragraph",
            content: "Your monthly dose of industry news, tips, and resources",
            styles: {
              fontSize: "16px",
              color: "#6b7280",
              textAlign: "center",
              margin: "0 0 32px 0",
            },
          },
        ],
        styles: {
          padding: "32px 24px",
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          margin: "0 0 24px 0",
        },
      },
      {
        id: "divider-newsletter-004",
        type: "divider",
        styles: {
          height: "3px",
          backgroundColor: "#3b82f6",
          margin: "24px 0",
          border: "none",
          width: "100px",
        },
      },
      {
        id: "heading-newsletter-005",
        type: "heading",
        content: "Featured Article: The Future of Digital Marketing",
        level: 2,
        styles: {
          fontSize: "24px",
          fontWeight: "bold",
          color: "#1f2937",
          margin: "0 0 16px 0",
        },
      },
      {
        id: "paragraph-newsletter-006",
        type: "paragraph",
        content:
          "AI is transforming how businesses connect with customers. Discover the latest trends and strategies for staying ahead in 2024.",
        styles: {
          fontSize: "16px",
          color: "#4b5563",
          margin: "0 0 24px 0",
          lineHeight: "1.6",
        },
      },
      {
        id: "button-newsletter-007",
        type: "button",
        content: "Read Full Article",
        styles: {
          backgroundColor: "#10b981",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "600",
          margin: "0 0 32px 0",
          display: "inline-block",
        },
      },
    ],
  },

  {
    id: "welcome4",
    name: "Welcome Email",
    description: "Perfect for welcoming new subscribers",
    icon: "👋",
    elements: [
      {
        id: "div-promo-001",
        type: "div",
        children: [
          {
            id: "heading-promo-002",
            type: "heading",
            content: "Limited Time Offer!",
            level: 1,
            styles: {
              fontSize: "36px",
              fontWeight: "bold",
              color: "#dc2626",
              textAlign: "center",
              margin: "0 0 8px 0",
            },
          },
          {
            id: "heading-promo-003",
            type: "heading",
            content: "50% OFF All Premium Plans",
            level: 2,
            styles: {
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1f2937",
              textAlign: "center",
              margin: "0 0 16px 0",
            },
          },
          {
            id: "paragraph-promo-004",
            type: "paragraph",
            content: "Ends December 31st • Use code: HOLIDAY50",
            styles: {
              fontSize: "18px",
              color: "#6b7280",
              textAlign: "center",
              margin: "0 0 32px 0",
              fontWeight: "600",
            },
          },
        ],
        styles: {
          padding: "40px 24px",
          backgroundColor: "#fef3c7",
          borderRadius: "12px",
          margin: "0 0 32px 0",
          border: "2px solid #f59e0b",
        },
      },
      {
        id: "columns-promo-005",
        type: "columns",
        columns: [
          [
            {
              id: "heading-promo-col1-001",
              type: "heading",
              content: "Basic",
              level: 3,
              styles: {
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 8px 0",
              },
            },
            {
              id: "paragraph-promo-col1-002",
              type: "paragraph",
              content: "$19/month",
              styles: {
                fontSize: "24px",
                color: "#3b82f6",
                fontWeight: "bold",
                margin: "0 0 16px 0",
              },
            },
          ],
          [
            {
              id: "heading-promo-col2-001",
              type: "heading",
              content: "Pro",
              level: 3,
              styles: {
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 8px 0",
              },
            },
            {
              id: "paragraph-promo-col2-002",
              type: "paragraph",
              content: "$49/month",
              styles: {
                fontSize: "24px",
                color: "#3b82f6",
                fontWeight: "bold",
                margin: "0 0 16px 0",
              },
            },
          ],
          [
            {
              id: "heading-promo-col3-001",
              type: "heading",
              content: "Enterprise",
              level: 3,
              styles: {
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 8px 0",
              },
            },
            {
              id: "paragraph-promo-col3-002",
              type: "paragraph",
              content: "$99/month",
              styles: {
                fontSize: "24px",
                color: "#3b82f6",
                fontWeight: "bold",
                margin: "0 0 16px 0",
              },
            },
          ],
        ],
        styles: {
          margin: "0 0 32px 0",
        },
        columnGap: "24px",
        columnAlign: "stretch",
      },
      {
        id: "button-promo-006",
        type: "button",
        content: "Claim Your Discount",
        styles: {
          backgroundColor: "#dc2626",
          color: "#ffffff",
          padding: "18px 40px",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          margin: "0 auto 24px auto",
          display: "block",
          width: "fit-content",
          textAlign: "center",
        },
      },
    ],
  },
  {
    id: "welcome5",
    name: "Welcome Email",
    description: "Perfect for welcoming new subscribers",
    icon: "👋",
    elements: [
      {
        id: "image-launch-001",
        type: "image",
        content:
          "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg",
        styles: {
          width: "100%",
          maxWidth: "600px",
          height: "auto",
          margin: "0 0 24px 0",
          borderRadius: "12px",
          display: "block",
        },
      },
      {
        id: "heading-launch-002",
        type: "heading",
        content: "Introducing: The Future is Here",
        level: 1,
        styles: {
          fontSize: "36px",
          fontWeight: "bold",
          color: "#1f2937",
          textAlign: "center",
          margin: "0 0 16px 0",
        },
      },
      {
        id: "paragraph-launch-003",
        type: "paragraph",
        content:
          "After years of research and development, we're excited to announce our revolutionary new product that will change the way you work forever.",
        styles: {
          fontSize: "18px",
          color: "#4b5563",
          textAlign: "center",
          margin: "0 0 32px 0",
          lineHeight: "1.6",
        },
      },
      {
        id: "div-launch-004",
        type: "div",
        children: [
          {
            id: "heading-launch-005",
            type: "heading",
            content: "Key Features",
            level: 2,
            styles: {
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 24px 0",
              textAlign: "center",
            },
          },
          {
            id: "columns-launch-006",
            type: "columns",
            columns: [
              [
                {
                  id: "paragraph-launch-col1-001",
                  type: "paragraph",
                  content: "⚡ Lightning Fast",
                  styles: {
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0 0 8px 0",
                  },
                },
                {
                  id: "paragraph-launch-col1-002",
                  type: "paragraph",
                  content: "10x faster than traditional solutions",
                  styles: {
                    fontSize: "14px",
                    color: "#6b7280",
                  },
                },
              ],
              [
                {
                  id: "paragraph-launch-col2-001",
                  type: "paragraph",
                  content: "🔒 Secure by Design",
                  styles: {
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0 0 8px 0",
                  },
                },
                {
                  id: "paragraph-launch-col2-002",
                  type: "paragraph",
                  content: "Enterprise-grade security",
                  styles: {
                    fontSize: "14px",
                    color: "#6b7280",
                  },
                },
              ],
              [
                {
                  id: "paragraph-launch-col3-001",
                  type: "paragraph",
                  content: "🤖 AI-Powered",
                  styles: {
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0 0 8px 0",
                  },
                },
                {
                  id: "paragraph-launch-col3-002",
                  type: "paragraph",
                  content: "Intelligent automation features",
                  styles: {
                    fontSize: "14px",
                    color: "#6b7280",
                  },
                },
              ],
            ],
            styles: {
              margin: "0 0 32px 0",
            },
            columnGap: "20px",
            columnAlign: "stretch",
          },
        ],
        styles: {
          padding: "32px 24px",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          margin: "0 0 32px 0",
        },
      },
      {
        id: "button-launch-007",
        type: "button",
        content: "Learn More & Pre-order",
        styles: {
          backgroundColor: "#8b5cf6",
          color: "#ffffff",
          padding: "16px 32px",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          margin: "0 auto 24px auto",
          display: "block",
          width: "fit-content",
        },
      },
    ],
  },
];
