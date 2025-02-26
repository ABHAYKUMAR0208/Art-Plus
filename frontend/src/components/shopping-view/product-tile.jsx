import PropTypes from "prop-types";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  className = "", // Allowing className to be passed as prop
}) {
  // Get authentication status from Redux
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Wrapper function for Add to Cart to handle authentication check
  const onAddToCartClick = () => {
    if (!isAuthenticated) {
      toast.error("Login required!"); // Show toast error if not logged in
      return;
    }
    handleAddtoCart(product?._id, product?.totalStock); // Proceed if authenticated
  };

  // Function to render stock status badge
  const renderStockBadge = () => {
    if (product?.totalStock === 0) {
      return (
        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
          Out Of Stock
        </Badge>
      );
    }
    if (product?.totalStock < 10) {
      return (
        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
          {`Only ${product?.totalStock} items left`}
        </Badge>
      );
    }
    if (product?.salePrice > 0) {
      return (
        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
          Sale
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className={`w-full max-w-sm mx-auto ${className}`}>
      <div
        onClick={() => handleGetProductDetails(product?._id)}
        className="cursor-pointer"
      >
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title || "Product Image"} // Added alt for accessibility
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {renderStockBadge()}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 && (
              <span className="text-lg font-semibold text-primary">
                ${product?.salePrice}
              </span>
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed" disabled>
            Out Of Stock
          </Button>
        ) : (
          <Button onClick={onAddToCartClick} className="w-full">
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Prop Type Validation
ShoppingProductTile.propTypes = {
  product: PropTypes.object.isRequired,
  handleGetProductDetails: PropTypes.func.isRequired,
  handleAddtoCart: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ShoppingProductTile;
