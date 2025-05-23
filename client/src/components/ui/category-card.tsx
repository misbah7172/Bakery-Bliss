import { Link } from "wouter";

interface CategoryCardProps {
  title: string;
  imageUrl: string;
  link: string;
}

const CategoryCard = ({ title, imageUrl, link }: CategoryCardProps) => {
  return (
    <Link href={link}>
      <div className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md h-48 block cursor-pointer">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
          <span className="text-white font-poppins font-medium text-xl">{title}</span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
