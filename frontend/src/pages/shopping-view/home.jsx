import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  fetchSaleProducts,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useLocation, useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { toast } from "react-toastify";
import { getFeatureImages } from "@/store/common-slice";

const categories = [
  { id: "dryerballs", label: "Dryer Balls" },
  { id: "feltballs", label: "Felt Balls" },
  { id: "craftsupplies", label: "Craft Supplies" },
  { id: "feltshoes", label: "Felt Shoes" },
  { id: "petproduction", label: "Pet Production" },
  { id: "decors", label: "Decors" },
  { id: "yarns", label: "Yarns" },
  { id: "fashion", label: "Fashion" },
];

function ShoppingHome() {
    const location = useLocation();
    console.log("Current Path:", location.pathname); // Debugging
    const isHomePage = location.pathname === "/shop/home"; // Check if the current route is the home page
    console.log("Is Home Page:", isHomePage); // Debugging
  
    const [currentSlide, setCurrentSlide] = useState(0);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const { productList, productDetails, saleProducts } = useSelector(
      (state) => state.shopProducts
    );
    const { featureImageList = [] } = useSelector((state) => state.commonFeature || {});
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    // Handle navigation to category listing page
    function handleNavigateToListingPage(getCurrentItem, section) {
      sessionStorage.removeItem("filters");
      const currentFilter = {
        [section]: [getCurrentItem.id],
      };
      sessionStorage.setItem("filters", JSON.stringify(currentFilter));
      navigate("/shop/listing");
    }
  
    // Get product details
    function handleGetProductDetails(getCurrentProductId) {
      dispatch(fetchProductDetails(getCurrentProductId));
    }
  
    // Add product to cart
    function handleAddtoCart(getCurrentProductId) {
      dispatch(
        addToCart({
          userId: user?.id,
          productId: getCurrentProductId,
          quantity: 1,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast.success("Product added to cart");
        }
      });
    }
  
    // Filter products added in the last week
    const getLastWeekProducts = () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 15);
      return productList.filter((product) => {
        const productDate = new Date(product.createdAt);
        return productDate >= oneWeekAgo;
      });
    };
  
    // Set up interval for carousel
    useEffect(() => {
      if (productDetails !== null) setOpenDetailsDialog(true);
    }, [productDetails]);
  
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
      }, 3000);
      return () => clearInterval(timer);
    }, [featureImageList]);
  
    // Fetch filtered products
    useEffect(() => {
      dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
    }, [dispatch]);
  
    // Fetch feature images
    useEffect(() => {
      dispatch(getFeatureImages());
    }, [dispatch]);
  
    // Fetch sale products on component mount
    useEffect(() => {
      dispatch(fetchSaleProducts());
    }, [dispatch]);
  
    // Function to filter products on sale
    const getProductsOnSale = () => {
      return saleProducts;
    };
  
    return (
      <div className="flex flex-col min-h-screen">
        {/* Carousel Section */}
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[400px] overflow-hidden">
          {featureImageList && featureImageList.length > 0 ? featureImageList.map((slide, index) => (
            <img
              src={slide?.image}
              alt={`Slide ${index + 1}`}
              key={index}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            />
          )) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentSlide((prevSlide) => (prevSlide - 1 + featureImageList.length) % featureImageList.length)
            }
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length)
            }
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
  
        {/* Shop by Category Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((categoryItem) => (
                <Card
                  onClick={() => handleNavigateToListingPage(categoryItem, "category")}
                  key={categoryItem.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <span className="font-bold">{categoryItem.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        {/* New Products Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">New Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getLastWeekProducts().length > 0 ? (
                getLastWeekProducts().map((productItem) => (
                  <ShoppingProductTile
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                    key={productItem.id}
                  />
                ))
              ) : (
                <p className="text-center">No products added in the 15 days.</p>
              )}
            </div>
          </div>
        </section>
  
        {/* Products on Sale Section (Conditional Rendering) */}
        {isHomePage && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Products on Sale</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getProductsOnSale().length > 0 ? (
                  getProductsOnSale().map((productItem) => (
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={productItem}
                      handleAddtoCart={handleAddtoCart}
                      key={productItem.id}
                    />
                  ))
                ) : (
                  <p className="text-center">No products on sale.</p>
                )}
              </div>
            </div>
          </section>
        )}
  
        {/* Product Details Dialog */}
        <ProductDetailsDialog
          open={openDetailsDialog}
          setOpen={setOpenDetailsDialog}
          productDetails={productDetails}
        />
      </div>
    );
  }
  
  export default ShoppingHome;
