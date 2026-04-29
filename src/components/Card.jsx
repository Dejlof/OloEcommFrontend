import { motion } from 'framer-motion';

const Card = ({ ImgSource, altname, Name, Price, w = 'w-40', h = 'h-50', border = 'rounded-none', text = 'text-left' }) => {
  return (
    <motion.div
      className={`${text}`}
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
    >
      <motion.img
        src={ImgSource}
        alt={altname}
        className={`${w} ${h} ${border} bg-gray-200 p-2`}
        whileHover={{ backgroundColor: '#ffedd5' }}
        transition={{ duration: 0.2 }}
      />
      <h3 className="pt-2">{Name}</h3>
      <p className="text-sm font-bold mb-3">{Price}</p>
    </motion.div>
  );
};

export default Card;
