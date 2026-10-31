import { Link } from "react-router-dom";
const shipnestLogo = "/assets/brand/shipnest-logo.png";
const shipnestMark = "/assets/brand/shipnest-mark.png";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
  size?: number;
  linkTo?: string | false;
  alt?: string;
}

const Logo = ({ variant = "full", className = "", size = 36, linkTo = "/", alt = "ShipNest" }: LogoProps) => {
  const src = variant === "mark" ? shipnestMark : shipnestLogo;
  const img = (
    <img
      src={src}
      alt={alt}
      style={{ height: size }}
      className={`w-auto object-contain select-none ${className}`}
      draggable={false}
    />
  );
  if (linkTo === false) return img;
  return (
    <Link to={linkTo} aria-label="ShipNest" className="inline-flex items-center">
      {img}
    </Link>
  );
};

export default Logo;