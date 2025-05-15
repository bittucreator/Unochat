"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { NextjsGenerationOptions } from "@/lib/types/nextjs"
import { Smartphone, Tablet, Monitor, Moon, Sun, Menu, X, ChevronRight } from "lucide-react"

interface LivePreviewProps {
  options: NextjsGenerationOptions
}

export function NextjsLivePreview({ options }: LivePreviewProps) {
  const [activeTab, setActiveTab] = useState("desktop")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Reset menu state when changing device view
  useEffect(() => {
    setIsMenuOpen(false)
  }, [activeTab])

  // Generate dynamic styles based on options
  const getStyles = () => {
    return {
      primaryColor: options.primaryColor,
      secondaryColor: options.secondaryColor,
      accentColor: options.accentColor || "#F43F5E",
      fontFamily: getFontFamily(options.fontFamily || "inter"),
      borderRadius: getBorderRadius(options.borderRadius || "medium"),
      backgroundColor: isDarkMode ? "#111827" : "#ffffff",
      textColor: isDarkMode ? "#f3f4f6" : "#1f2937",
      mutedTextColor: isDarkMode ? "#9ca3af" : "#6b7280",
      cardBgColor: isDarkMode ? "#1f2937" : "#f9fafb",
      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
    }
  }

  const getFontFamily = (font: string) => {
    switch (font) {
      case "inter":
        return "'Inter', sans-serif"
      case "roboto":
        return "'Roboto', sans-serif"
      case "open-sans":
        return "'Open Sans', sans-serif"
      case "poppins":
        return "'Poppins', sans-serif"
      case "system":
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      default:
        return "'Inter', sans-serif"
    }
  }

  const getBorderRadius = (radius: string) => {
    switch (radius) {
      case "none":
        return "0px"
      case "small":
        return "0.25rem"
      case "medium":
        return "0.5rem"
      case "large":
        return "0.75rem"
      case "full":
        return "9999px"
      default:
        return "0.5rem"
    }
  }

  const styles = getStyles()

  // Get container width based on active device tab
  const getContainerWidth = () => {
    switch (activeTab) {
      case "mobile":
        return "320px"
      case "tablet":
        return "768px"
      case "desktop":
        return "100%"
      default:
        return "100%"
    }
  }

  // Get container height based on active device tab
  const getContainerHeight = () => {
    switch (activeTab) {
      case "mobile":
        return "568px"
      case "tablet":
        return "1024px"
      case "desktop":
        return "600px"
      default:
        return "600px"
    }
  }

  // Render navigation based on selected style
  const renderNavigation = () => {
    const navItems = [
      { label: "Home", isActive: true },
      { label: "About", isActive: false },
      { label: "Services", isActive: false },
      { label: "Blog", isActive: false },
      { label: "Contact", isActive: false },
    ]

    if (options.navigationStyle === "horizontal" || options.navigationStyle === "both") {
      return (
        <div
          style={{
            backgroundColor: styles.backgroundColor,
            borderBottom: `1px solid ${styles.borderColor}`,
            color: styles.textColor,
          }}
          className="w-full py-4 px-6 flex justify-between items-center"
        >
          <div style={{ color: styles.primaryColor }} className="font-bold text-xl">
            Logo
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item, index) => (
              <div
                key={index}
                style={{
                  color: item.isActive ? styles.primaryColor : styles.textColor,
                  fontFamily: styles.fontFamily,
                }}
                className={`cursor-pointer ${item.isActive ? "font-medium" : ""}`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ color: styles.textColor }}
              className="focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  // Render mobile menu
  const renderMobileMenu = () => {
    if (!isMenuOpen) return null

    const navItems = [
      { label: "Home", isActive: true },
      { label: "About", isActive: false },
      { label: "Services", isActive: false },
      { label: "Blog", isActive: false },
      { label: "Contact", isActive: false },
    ]

    return (
      <div
        style={{
          backgroundColor: styles.backgroundColor,
          borderBottom: `1px solid ${styles.borderColor}`,
          color: styles.textColor,
        }}
        className="md:hidden px-6 py-4"
      >
        <div className="flex flex-col space-y-3">
          {navItems.map((item, index) => (
            <div
              key={index}
              style={{
                color: item.isActive ? styles.primaryColor : styles.textColor,
                fontFamily: styles.fontFamily,
              }}
              className={`cursor-pointer ${item.isActive ? "font-medium" : ""}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render sidebar if vertical navigation is selected
  const renderSidebar = () => {
    if (options.navigationStyle !== "vertical" && options.navigationStyle !== "both") return null

    const navItems = [
      { label: "Dashboard", isActive: true },
      { label: "Projects", isActive: false },
      { label: "Tasks", isActive: false },
      { label: "Calendar", isActive: false },
      { label: "Reports", isActive: false },
      { label: "Settings", isActive: false },
    ]

    return (
      <div
        style={{
          backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
          borderRight: `1px solid ${styles.borderColor}`,
          color: styles.textColor,
          width: "240px",
          fontFamily: styles.fontFamily,
        }}
        className="hidden md:block h-full overflow-auto"
      >
        <div className="p-4 border-b" style={{ borderColor: styles.borderColor }}>
          <div style={{ color: styles.primaryColor }} className="font-bold text-xl">
            Logo
          </div>
        </div>
        <div className="p-2">
          {navItems.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: item.isActive ? `${styles.primaryColor}20` : "transparent",
                color: item.isActive ? styles.primaryColor : styles.textColor,
                borderRadius: styles.borderRadius,
              }}
              className="flex items-center px-3 py-2 my-1 cursor-pointer hover:bg-opacity-10"
            >
              <div
                className="w-5 h-5 mr-3 rounded-md"
                style={{ backgroundColor: item.isActive ? styles.primaryColor : styles.mutedTextColor }}
              ></div>
              <span>{item.label}</span>
              {item.isActive && <ChevronRight size={16} className="ml-auto" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render hero section
  const renderHero = () => {
    return (
      <div
        style={{
          background: `linear-gradient(to right, ${styles.primaryColor}, ${styles.secondaryColor})`,
          color: "#ffffff",
          padding: "3rem 1.5rem",
          fontFamily: styles.fontFamily,
        }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Your Website</h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          A beautiful, customizable website built with Next.js and Tailwind CSS.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            style={{
              backgroundColor: "#ffffff",
              color: styles.primaryColor,
              borderRadius: styles.borderRadius,
            }}
            className="px-6 py-2 font-medium"
          >
            Get Started
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              border: "2px solid #ffffff",
              borderRadius: styles.borderRadius,
            }}
            className="px-6 py-2 font-medium"
          >
            Learn More
          </button>
        </div>
      </div>
    )
  }

  // Render features section
  const renderFeatures = () => {
    const features = [
      { title: "Feature 1", description: "Description of this amazing feature and how it helps users." },
      { title: "Feature 2", description: "Description of this amazing feature and how it helps users." },
      { title: "Feature 3", description: "Description of this amazing feature and how it helps users." },
    ]

    return (
      <div
        style={{
          backgroundColor: styles.backgroundColor,
          color: styles.textColor,
          padding: "3rem 1.5rem",
          fontFamily: styles.fontFamily,
        }}
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Features</h2>
          <p style={{ color: styles.mutedTextColor }} className="max-w-2xl mx-auto">
            Discover the amazing features that make our product stand out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                backgroundColor: styles.cardBgColor,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.borderColor}`,
              }}
              className="p-6"
            >
              <div
                style={{ backgroundColor: styles.primaryColor }}
                className="w-12 h-12 rounded-full mb-4 flex items-center justify-center text-white"
              >
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p style={{ color: styles.mutedTextColor }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render footer
  const renderFooter = () => {
    if (options.footerStyle === "none") return null

    if (options.footerStyle === "minimal") {
      return (
        <div
          style={{
            backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
            borderTop: `1px solid ${styles.borderColor}`,
            color: styles.mutedTextColor,
            fontFamily: styles.fontFamily,
          }}
          className="py-4 px-6 text-center"
        >
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      )
    }

    // Simple or detailed footer
    return (
      <div
        style={{
          backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
          borderTop: `1px solid ${styles.borderColor}`,
          color: styles.textColor,
          fontFamily: styles.fontFamily,
        }}
        className="py-8 px-6"
      >
        <div
          className={`grid grid-cols-1 ${options.footerStyle === "detailed" ? "md:grid-cols-4" : "md:grid-cols-3"} gap-8 max-w-6xl mx-auto`}
        >
          <div>
            <h3 style={{ color: styles.primaryColor }} className="font-bold text-lg mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                About
              </li>
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Careers
              </li>
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Blog
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: styles.primaryColor }} className="font-bold text-lg mb-3">
              Products
            </h3>
            <ul className="space-y-2">
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Features
              </li>
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Pricing
              </li>
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Documentation
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ color: styles.primaryColor }} className="font-bold text-lg mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Help Center
              </li>
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Contact
              </li>
              <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:underline">
                Privacy
              </li>
            </ul>
          </div>
          {options.footerStyle === "detailed" && (
            <div>
              <h3 style={{ color: styles.primaryColor }} className="font-bold text-lg mb-3">
                Newsletter
              </h3>
              <p style={{ color: styles.mutedTextColor }} className="mb-3">
                Subscribe to our newsletter for updates
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  style={{
                    backgroundColor: styles.backgroundColor,
                    border: `1px solid ${styles.borderColor}`,
                    borderRadius: `${styles.borderRadius} 0 0 ${styles.borderRadius}`,
                    color: styles.textColor,
                  }}
                  className="px-3 py-2 w-full"
                />
                <button
                  style={{
                    backgroundColor: styles.primaryColor,
                    borderRadius: `0 ${styles.borderRadius} ${styles.borderRadius} 0`,
                  }}
                  className="px-4 py-2 text-white"
                >
                  Subscribe
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 pt-4 border-t text-center" style={{ borderColor: styles.borderColor }}>
          <p style={{ color: styles.mutedTextColor }}>
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    )
  }

  // Render content based on layout type
  const renderContent = () => {
    switch (options.layout) {
      case "dashboard":
        return (
          <div className="flex h-full" style={{ backgroundColor: styles.backgroundColor }}>
            {renderSidebar()}
            <div className="flex-1 flex flex-col overflow-hidden">
              {options.navigationStyle === "horizontal" || options.navigationStyle === "both" ? (
                <>
                  {renderNavigation()}
                  {renderMobileMenu()}
                </>
              ) : null}
              <div className="flex-1 p-6 overflow-auto">
                <div
                  style={{
                    backgroundColor: styles.cardBgColor,
                    borderRadius: styles.borderRadius,
                    border: `1px solid ${styles.borderColor}`,
                    fontFamily: styles.fontFamily,
                  }}
                  className="p-6 mb-6"
                >
                  <h1 className="text-2xl font-bold mb-4" style={{ color: styles.textColor }}>
                    Dashboard
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: styles.backgroundColor,
                          borderRadius: styles.borderRadius,
                          border: `1px solid ${styles.borderColor}`,
                        }}
                        className="p-4"
                      >
                        <h3 className="font-medium mb-2" style={{ color: styles.textColor }}>
                          Metric {i}
                        </h3>
                        <p className="text-2xl font-bold" style={{ color: styles.primaryColor }}>
                          {i * 1234}
                        </p>
                        <p style={{ color: styles.mutedTextColor }} className="text-sm">
                          +{i * 5.7}% from last month
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: styles.cardBgColor,
                    borderRadius: styles.borderRadius,
                    border: `1px solid ${styles.borderColor}`,
                    fontFamily: styles.fontFamily,
                  }}
                  className="p-6"
                >
                  <h2 className="text-xl font-bold mb-4" style={{ color: styles.textColor }}>
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          borderBottom: i < 4 ? `1px solid ${styles.borderColor}` : "none",
                        }}
                        className="pb-4"
                      >
                        <div className="flex justify-between">
                          <p style={{ color: styles.textColor }}>Activity {i}</p>
                          <p style={{ color: styles.mutedTextColor }}>2h ago</p>
                        </div>
                        <p style={{ color: styles.mutedTextColor }}>Description of activity {i} and what happened.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "blog":
        return (
          <div className="flex flex-col min-h-full" style={{ backgroundColor: styles.backgroundColor }}>
            {renderNavigation()}
            {renderMobileMenu()}
            <div className="flex-1">
              <div
                style={{
                  backgroundColor: styles.primaryColor,
                  color: "#ffffff",
                  padding: "3rem 1.5rem",
                  fontFamily: styles.fontFamily,
                }}
                className="text-center"
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Blog</h1>
                <p className="text-lg mb-6 max-w-2xl mx-auto">Latest news, updates, and insights from our team.</p>
              </div>

              <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: styles.cardBgColor,
                        borderRadius: styles.borderRadius,
                        border: `1px solid ${styles.borderColor}`,
                        overflow: "hidden",
                        fontFamily: styles.fontFamily,
                      }}
                      className="flex flex-col h-full"
                    >
                      <div
                        style={{
                          backgroundColor: `${styles.primaryColor}20`,
                          height: "160px",
                        }}
                        className="flex items-center justify-center"
                      >
                        <div style={{ color: styles.primaryColor }}>Image Placeholder</div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div style={{ color: styles.mutedTextColor }} className="text-sm mb-2">
                          May {i + 10}, 2023
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: styles.textColor }}>
                          Blog Post Title {i}
                        </h3>
                        <p style={{ color: styles.mutedTextColor }} className="mb-4 flex-1">
                          A short description of the blog post and what readers can expect to learn.
                        </p>
                        <div>
                          <button
                            style={{
                              color: styles.primaryColor,
                              fontWeight: "medium",
                            }}
                            className="flex items-center"
                          >
                            Read More <ChevronRight size={16} className="ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {renderFooter()}
          </div>
        )

      case "ecommerce":
        return (
          <div className="flex flex-col min-h-full" style={{ backgroundColor: styles.backgroundColor }}>
            {renderNavigation()}
            {renderMobileMenu()}
            <div className="flex-1">
              <div
                style={{
                  background: `linear-gradient(to right, ${styles.primaryColor}, ${styles.secondaryColor})`,
                  color: "#ffffff",
                  padding: "3rem 1.5rem",
                  fontFamily: styles.fontFamily,
                }}
                className="text-center"
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Shop Our Products</h1>
                <p className="text-lg mb-6 max-w-2xl mx-auto">Quality products at affordable prices.</p>
                <div className="max-w-md mx-auto relative">
                  <input
                    type="search"
                    placeholder="Search products..."
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: styles.borderRadius,
                      color: "#1f2937",
                    }}
                    className="w-full px-4 py-3 pr-10"
                  />
                  <div className="absolute right-3 top-3">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ color: "#6b7280" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: styles.cardBgColor,
                        borderRadius: styles.borderRadius,
                        border: `1px solid ${styles.borderColor}`,
                        overflow: "hidden",
                        fontFamily: styles.fontFamily,
                      }}
                      className="flex flex-col"
                    >
                      <div
                        style={{
                          backgroundColor: `${styles.primaryColor}10`,
                          height: "180px",
                        }}
                        className="flex items-center justify-center"
                      >
                        <div style={{ color: styles.primaryColor }}>Product Image</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-1" style={{ color: styles.textColor }}>
                          Product {i}
                        </h3>
                        <p style={{ color: styles.mutedTextColor }} className="text-sm mb-2">
                          Category
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="font-bold" style={{ color: styles.textColor }}>
                            ${(19.99 + i).toFixed(2)}
                          </p>
                          <button
                            style={{
                              backgroundColor: styles.primaryColor,
                              borderRadius: styles.borderRadius,
                            }}
                            className="px-3 py-1 text-white text-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {renderFooter()}
          </div>
        )

      case "portfolio":
        return (
          <div className="flex flex-col min-h-full" style={{ backgroundColor: styles.backgroundColor }}>
            {renderNavigation()}
            {renderMobileMenu()}
            <div className="flex-1">
              <div
                style={{
                  backgroundColor: styles.backgroundColor,
                  color: styles.textColor,
                  padding: "5rem 1.5rem 3rem",
                  fontFamily: styles.fontFamily,
                }}
                className="text-center"
              >
                <div
                  style={{
                    backgroundColor: `${styles.primaryColor}20`,
                    color: styles.primaryColor,
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                  }}
                  className="mx-auto mb-6 flex items-center justify-center"
                >
                  Profile
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">John Doe</h1>
                <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: styles.mutedTextColor }}>
                  Web Developer & Designer
                </p>
                <div className="flex justify-center space-x-4">
                  {["GitHub", "LinkedIn", "Twitter"].map((social) => (
                    <button
                      key={social}
                      style={{
                        backgroundColor: styles.cardBgColor,
                        borderRadius: styles.borderRadius,
                        border: `1px solid ${styles.borderColor}`,
                        color: styles.textColor,
                      }}
                      className="px-4 py-2"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: styles.textColor }}>
                  My Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: styles.cardBgColor,
                        borderRadius: styles.borderRadius,
                        border: `1px solid ${styles.borderColor}`,
                        overflow: "hidden",
                        fontFamily: styles.fontFamily,
                      }}
                      className="flex flex-col"
                    >
                      <div
                        style={{
                          backgroundColor:
                            i % 3 === 0
                              ? `${styles.primaryColor}20`
                              : i % 3 === 1
                                ? `${styles.secondaryColor}20`
                                : `${styles.accentColor}20`,
                          height: "200px",
                        }}
                        className="flex items-center justify-center"
                      >
                        <div
                          style={{
                            color:
                              i % 3 === 0
                                ? styles.primaryColor
                                : i % 3 === 1
                                  ? styles.secondaryColor
                                  : styles.accentColor,
                          }}
                        >
                          Project Image
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2" style={{ color: styles.textColor }}>
                          Project {i}
                        </h3>
                        <p style={{ color: styles.mutedTextColor }} className="mb-4">
                          A short description of the project and the technologies used.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["React", "Next.js", "Tailwind"].map((tech) => (
                            <span
                              key={tech}
                              style={{
                                backgroundColor: `${styles.primaryColor}10`,
                                color: styles.primaryColor,
                                borderRadius: styles.borderRadius,
                              }}
                              className="px-2 py-1 text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {renderFooter()}
          </div>
        )

      case "docs":
        return (
          <div className="flex h-full" style={{ backgroundColor: styles.backgroundColor }}>
            <div
              style={{
                backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                borderRight: `1px solid ${styles.borderColor}`,
                color: styles.textColor,
                width: "240px",
                fontFamily: styles.fontFamily,
              }}
              className="hidden md:block h-full overflow-auto"
            >
              <div className="p-4 border-b" style={{ borderColor: styles.borderColor }}>
                <div style={{ color: styles.primaryColor }} className="font-bold text-xl">
                  Docs
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2" style={{ color: styles.textColor }}>
                    Getting Started
                  </h3>
                  <ul className="space-y-1 pl-2">
                    <li style={{ color: styles.primaryColor }} className="cursor-pointer">
                      Introduction
                    </li>
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Installation
                    </li>
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Configuration
                    </li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="font-medium mb-2" style={{ color: styles.textColor }}>
                    Components
                  </h3>
                  <ul className="space-y-1 pl-2">
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Button
                    </li>
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Card
                    </li>
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Form
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2" style={{ color: styles.textColor }}>
                    API Reference
                  </h3>
                  <ul className="space-y-1 pl-2">
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Authentication
                    </li>
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Endpoints
                    </li>
                    <li style={{ color: styles.mutedTextColor }} className="cursor-pointer hover:text-primary">
                      Error Handling
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              {options.navigationStyle === "horizontal" || options.navigationStyle === "both" ? (
                <>
                  {renderNavigation()}
                  {renderMobileMenu()}
                </>
              ) : null}
              <div className="flex-1 p-6 overflow-auto">
                <div
                  style={{
                    maxWidth: "768px",
                    margin: "0 auto",
                    fontFamily: styles.fontFamily,
                  }}
                >
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4" style={{ color: styles.textColor }}>
                      Introduction
                    </h1>
                    <p style={{ color: styles.mutedTextColor }} className="text-lg">
                      Welcome to the documentation. This guide will help you get started with our product.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: styles.textColor }}>
                      What is Our Product?
                    </h2>
                    <p style={{ color: styles.mutedTextColor }} className="mb-4">
                      Our product is a comprehensive solution for building modern web applications. It provides a set of
                      tools and components to help you build faster and more efficiently.
                    </p>
                    <p style={{ color: styles.mutedTextColor }}>
                      Whether you're building a simple website or a complex application, our product has everything you
                      need to get started.
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: styles.cardBgColor,
                      borderRadius: styles.borderRadius,
                      border: `1px solid ${styles.borderColor}`,
                    }}
                    className="p-4 mb-8"
                  >
                    <h3 className="font-medium mb-2" style={{ color: styles.textColor }}>
                      Quick Start
                    </h3>
                    <div
                      style={{
                        backgroundColor: isDarkMode ? "#111827" : "#f1f5f9",
                        borderRadius: styles.borderRadius,
                        fontFamily: "monospace",
                      }}
                      className="p-3 overflow-x-auto"
                    >
                      <code style={{ color: isDarkMode ? "#e5e7eb" : "#334155" }}>npm install our-product</code>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: styles.textColor }}>
                      Key Features
                    </h2>
                    <ul className="space-y-2 list-disc pl-5">
                      <li style={{ color: styles.mutedTextColor }}>Easy to use API</li>
                      <li style={{ color: styles.mutedTextColor }}>Comprehensive documentation</li>
                      <li style={{ color: styles.mutedTextColor }}>Regular updates and improvements</li>
                      <li style={{ color: styles.mutedTextColor }}>Responsive support team</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      // Default to landing page layout
      default:
        return (
          <div className="flex flex-col min-h-full" style={{ backgroundColor: styles.backgroundColor }}>
            {renderNavigation()}
            {renderMobileMenu()}
            <div className="flex-1">
              {renderHero()}
              {renderFeatures()}
            </div>
            {renderFooter()}
          </div>
        )
    }
  }

  return (
    <Card className="h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="desktop" className="flex items-center gap-1">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center gap-1">
              <Tablet className="h-4 w-4" />
              <span className="hidden sm:inline">Tablet</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <ScrollArea className="h-[600px] w-full">
        <div className="p-4">
          <div
            style={{
              width: getContainerWidth(),
              height: getContainerHeight(),
              margin: "0 auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </ScrollArea>
    </Card>
  )
}
