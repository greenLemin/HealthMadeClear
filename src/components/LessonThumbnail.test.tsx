import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LessonThumbnail from "./LessonThumbnail";

vi.mock("next/image", () => ({
  default: ({ src, alt, priority, className, fill, sizes, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-priority={priority} className={className} {...props} />;
  },
}));

describe("LessonThumbnail", () => {
  const defaultProps = {
    categoryId: "medication-safety" as const,
    title: "Understanding Prescription Labels",
  };

  it("renders an image when the image prop is provided", () => {
    render(<LessonThumbnail {...defaultProps} image="/test-image.jpg" />);
    const image = screen.getByRole("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-image.jpg");
    expect(image).toHaveAttribute("alt", defaultProps.title);
  });

  it("uses imageAlt when provided", () => {
    render(<LessonThumbnail {...defaultProps} image="/test-image.jpg" imageAlt="Custom alt text" />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "Custom alt text");
  });

  it("renders the fallback visual when no image is provided", () => {
    render(<LessonThumbnail {...defaultProps} />);
    const fallbackEmoji = screen.getByText("💊");
    expect(fallbackEmoji).toBeInTheDocument();

    const srTitle = screen.getByText(defaultProps.title);
    expect(srTitle).toBeInTheDocument();
    expect(srTitle).toHaveClass("sr-only");
  });

  it("applies custom className", () => {
    const { container } = render(<LessonThumbnail {...defaultProps} className="custom-class-123" />);
    expect(container.firstChild).toHaveClass("custom-class-123");
  });

  it("applies custom className when image is present", () => {
    const { container } = render(
      <LessonThumbnail {...defaultProps} image="/test-image.jpg" className="custom-class-456" />
    );
    expect(container.firstChild).toHaveClass("custom-class-456");
  });

  it("passes priority prop to the image", () => {
    render(<LessonThumbnail {...defaultProps} image="/test-image.jpg" priority={true} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("data-priority", "true");
  });
});
