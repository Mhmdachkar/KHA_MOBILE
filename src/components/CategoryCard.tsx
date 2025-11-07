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
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      <motion.div 
        className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 relative z-10"
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="h-8 w-8 sm:h-10 sm:w-10 object-contain transition-all duration-300 group-hover:scale-110" 
          />
        ) : Icon ? (
          <Icon className="h-8 w-8 sm:h-10 sm:w-10 stroke-[1.5] text-foreground group-hover:text-primary transition-colors duration-300" />
        ) : null}
      </motion.div>
      <p className="text-elegant text-[10px] sm:text-xs relative z-10 group-hover:text-primary transition-colors duration-300 text-center leading-tight px-1">{name}</p>
    </>
  );

  const cardClassName = "flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-card border border-border rounded-sm hover:border-primary/40 transition-all duration-500 group shadow-card hover:shadow-elegant relative overflow-hidden w-full";

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
