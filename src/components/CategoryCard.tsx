import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  icon?: LucideIcon;
  image?: string;
  name: string;
  onClick?: () => void;
  linkTo?: string;
}

const CategoryCard = ({ icon: Icon, image, name, onClick, linkTo }: CategoryCardProps) => {
  const cardContent = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center mb-3 relative z-10 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 shadow-sm">
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain transition-all duration-300 group-hover:scale-110" 
          />
        ) : Icon ? (
          <Icon className="h-7 w-7 sm:h-8 sm:w-8 stroke-[1.5] text-primary/70 group-hover:text-primary transition-colors duration-300" />
        ) : null}
      </div>
      <p className="text-[11px] sm:text-xs font-medium relative z-10 group-hover:text-primary transition-colors duration-300 text-center leading-tight px-1">{name}</p>
    </>
  );

  const cardClassName = "flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 bg-card border border-border/60 rounded-2xl hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden w-full";

  if (linkTo) {
      return (
        <Link to={linkTo} className="block">
          <motion.button
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: "transform" }}
            className={`${cardClassName} cursor-pointer w-full`}
          >
          {cardContent}
        </motion.button>
      </Link>
    );
  }

      return (
        <motion.button
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          style={{ willChange: "transform" }}
          className={cardClassName}
        >
      {cardContent}
    </motion.button>
  );
};

export default CategoryCard;
