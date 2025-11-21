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
    description: "Professional corporate update with multiple sections",
    thumbnail:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "Quarterly Business Update",
            level: 1,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Dear Team,<br><br>We're excited to share our Q3 achievements and upcoming initiatives. This quarter has been marked by significant growth and new opportunities.",
          },
        },
        {
          type: "delimiter",
          data: {},
        },
        {
          type: "header",
          data: {
            text: "🎯 Key Achievements",
            level: 2,
          },
        },
        {
          type: "list",
          data: {
            style: "unordered",
            items: [
              "Revenue growth of 25% compared to last quarter",
              "Successful launch of 3 new product features",
              "Expanded team with 15 new talented members",
              "Achieved 99.8% customer satisfaction rate",
            ],
          },
        },
        {
          type: "header",
          data: {
            text: "📊 Performance Metrics",
            level: 2,
          },
        },
        {
          type: "table",
          data: {
            withHeadings: true,
            content: [
              ["Metric", "Current", "Previous", "Growth"],
              ["Revenue", "$4.2M", "$3.4M", "+23.5%"],
              ["Users", "45,200", "38,500", "+17.4%"],
              ["Engagement", "4.2/5", "3.9/5", "+7.7%"],
            ],
          },
        },
        {
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600",
            },
            caption: "Team celebrating quarterly success",
            withBorder: true,
            stretched: false,
          },
        },
      ],
      version: "2.30.8",
    },
  },
  {
    id: "product-launch",
    title: "Product Launch",
    description: "Exciting new product announcement with features",
    thumbnail:
      "https://images.unsplash.com/photo-1556656882-b5ff6c4e14b1?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "🚀 Introducing Our New Platform",
            level: 1,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "We're thrilled to announce the launch of our revolutionary new platform designed to transform your workflow and boost productivity.",
          },
        },
        {
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600",
            },
            caption: "New Platform Interface",
            withBorder: false,
            stretched: true,
          },
        },
        {
          type: "header",
          data: {
            text: "✨ Key Features",
            level: 2,
          },
        },
        {
          type: "list",
          data: {
            style: "ordered",
            items: [
              "AI-powered automation that saves 10+ hours weekly",
              "Real-time collaboration with team members",
              "Advanced analytics and reporting dashboard",
              "Seamless integration with your favorite tools",
              "Enterprise-grade security and compliance",
            ],
          },
        },
        {
          type: "quote",
          data: {
            text: "This platform has completely transformed how our team works together. The efficiency gains are incredible!",
            caption: "Sarah Chen, Early Beta User",
            alignment: "left",
          },
        },
        {
          type: "button",
          data: {
            link: "https://example.com/try-now",
            text: "Start Your Free Trial",
          },
        },
      ],
      version: "2.30.8",
    },
  },
  {
    id: "event-invitation",
    title: "Event Invitation",
    description: "Elegant event invitation with details and RSVP",
    thumbnail:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "📅 You're Invited: Annual Tech Summit 2024",
            level: 1,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Join industry leaders and innovators for an unforgettable experience at our flagship technology conference.",
          },
        },
        {
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
            },
            caption: "Tech Summit 2023 Highlights",
            withBorder: true,
            stretched: false,
          },
        },
        {
          type: "header",
          data: {
            text: "Event Details",
            level: 2,
          },
        },
        {
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
        {
          type: "header",
          data: {
            text: "Featured Speakers",
            level: 3,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "• Dr. Maria Rodriguez - AI Research Director<br>• James Kim - Startup Founder & Investor<br>• Lisa Thompson - Digital Transformation Expert<br>• David Park - Cybersecurity Authority",
          },
        },
        {
          type: "button",
          data: {
            link: "https://example.com/rsvp",
            text: "RSVP Now",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "<em>Limited seats available. Reserve your spot today!</em>",
          },
        },
      ],
      version: "2.30.8",
    },
  },
  {
    id: "welcome-series",
    title: "Welcome Series",
    description: "Warm welcome email for new users/customers",
    thumbnail:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "👋 Welcome to Our Community!",
            level: 1,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Hi [Name],<br><br>We're excited to have you join thousands of professionals who are already transforming their work with our platform.",
          },
        },
        {
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600",
            },
            caption: "Your journey starts here",
            withBorder: false,
            stretched: false,
          },
        },
        {
          type: "header",
          data: {
            text: "Here's How to Get Started",
            level: 2,
          },
        },
        {
          type: "list",
          data: {
            style: "ordered",
            items: [
              "Complete your profile setup",
              "Connect with team members",
              "Explore our tutorial videos",
              "Set up your first project",
              "Join our community forum",
            ],
          },
        },
        {
          type: "header",
          data: {
            text: "Need Help?",
            level: 3,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Our support team is here for you:<br>• 📞 <strong>Live Chat:</strong> Available 24/7<br>• 📧 <strong>Email:</strong> support@example.com<br>• 📚 <strong>Help Center:</strong> Extensive guides & tutorials",
          },
        },
        {
          type: "button",
          data: {
            link: "https://example.com/get-started",
            text: "Explore Your Dashboard",
          },
        },
      ],
      version: "2.30.8",
    },
  },
  {
    id: "marketing-promo",
    title: "Marketing Promotion",
    description: "Eye-catching promotional campaign",
    thumbnail:
      "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "🎉 Flash Sale - 48 Hours Only!",
            level: 1,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Don't miss our biggest sale of the year! For the next 48 hours, enjoy incredible discounts across all premium plans.",
          },
        },
        {
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=600",
            },
            caption: "Limited Time Offer",
            withBorder: false,
            stretched: true,
          },
        },
        {
          type: "header",
          data: {
            text: "🔥 Exclusive Offers",
            level: 2,
          },
        },
        {
          type: "table",
          data: {
            withHeadings: true,
            content: [
              ["Plan", "Regular Price", "Sale Price", "Savings"],
              ["Starter", "$29/month", "$14.50/month", "50% OFF"],
              ["Professional", "$79/month", "$39.50/month", "50% OFF"],
              ["Enterprise", "$199/month", "$99.50/month", "50% OFF"],
            ],
          },
        },
        {
          type: "paragraph",
          data: {
            text: "<strong>Use code:</strong> <code>FLASH50</code> at checkout",
          },
        },
        {
          type: "warning",
          data: {
            title: "Hurry! Offer ends soon",
            message:
              "This special pricing is available for new customers only and ends on Friday at midnight.",
          },
        },
        {
          type: "button",
          data: {
            link: "https://example.com/shop-now",
            text: "Claim Your Discount",
          },
        },
      ],
      version: "2.30.8",
    },
  },
  {
    id: "educational-newsletter",
    title: "Educational Newsletter",
    description: "Informative educational content with resources",
    thumbnail:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "📚 Learning Hub Monthly Digest",
            level: 1,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Expand your knowledge with this month's curated resources, expert insights, and learning opportunities.",
          },
        },
        {
          type: "header",
          data: {
            text: "Featured Article",
            level: 2,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "<strong>The Future of Remote Collaboration</strong><br>Discover how distributed teams are achieving unprecedented productivity through new collaboration frameworks and tools.",
          },
        },
        {
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600",
            },
            caption: "Remote team collaboration in action",
            withBorder: true,
            stretched: false,
          },
        },
        {
          type: "header",
          data: {
            text: "This Month's Resources",
            level: 3,
          },
        },
        {
          type: "list",
          data: {
            style: "unordered",
            items: [
              "📖 Free eBook: 'Advanced Project Management Techniques'",
              "🎥 Webinar Recording: 'AI in Everyday Workflows'",
              "📊 Template: 'Quarterly Planning Dashboard'",
              "🎧 Podcast: 'Interview with Industry Leaders'",
            ],
          },
        },
        {
          type: "quote",
          data: {
            text: "Continuous learning is the minimum requirement for success in any field.",
            caption: "Brian Tracy",
            alignment: "center",
          },
        },
        {
          type: "button",
          data: {
            link: "https://example.com/access-resources",
            text: "Access All Resources",
          },
        },
      ],
      version: "2.30.8",
    },
  },
  {
    id: "company-update",
    title: "Company Update",
    description: "Important company news and announcements",
    thumbnail:
      "https://images.unsplash.com/photo-1565689228644-83e87bb6a5e1?w=400",
    data: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "🏢 Important Company Announcement",
            level: 1,
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Dear Valued Customers and Partners,<br><br>We have some exciting news to share about our company's growth and future direction.",
          },
        },
        {
          type: "header",
          data: {
            text: "What's Changing",
            level: 2,
          },
        },
        {
          type: "list",
          data: {
            style: "unordered",
            items: [
              "New headquarters opening in Austin, TX",
              "Expanded customer support hours (now 24/7)",
              "Enhanced security features across all products",
              "New leadership appointments in key departments",
            ],
          },
        },
        {
          type: "image",
          data: {
            file: {
              url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
            },
            caption: "Our new headquarters building",
            withBorder: true,
            stretched: false,
          },
        },
        {
          type: "header",
          data: {
            text: "What Stays the Same",
            level: 2,
          },
        },
        {
          type: "list",
          data: {
            style: "unordered",
            items: [
              "Our commitment to customer satisfaction",
              "Current pricing for existing customers",
              "Product quality and reliability standards",
              "Our dedication to innovation and excellence",
            ],
          },
        },
        {
          type: "paragraph",
          data: {
            text: "We're committed to providing even better service and innovation as we continue to grow. Thank you for being part of our journey.",
          },
        },
        {
          type: "button",
          data: {
            link: "https://example.com/learn-more",
            text: "Read Full Announcement",
          },
        },
      ],
      version: "2.30.8",
    },
  },
];

export default PREDEFINED_TEMPLATES;
