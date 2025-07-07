import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

const categories = [
    { name: "Curated", query: "" }, // Special category for curated photos
    { name: "Nature", query: "nature" },
    { name: "Animals", query: "animals" },
    { name: "Technology", query: "technology" },
    { name: "Abstract", query: "abstract" },
    { name: "Food", query: "food" },
    { name: "Travel", query: "travel" },
    { name: "People", query: "people" },
];

const ExplorePage = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Default to Curated
    const [searchQuery, setSearchQuery] = useState("");
    const [currentSearchTerm, setCurrentSearchTerm] = useState("");
    const observer = useRef();

    const fetchImages = useCallback(async (reset = false) => {
        if (loading) return;
        if (reset) {
            setPage(1);
            setImages([]);
            setHasMore(true);
            setLoading(true);
        } else if (!hasMore) {
            return;
        }

        setLoading(true);
        try {
            let response;
            const headers = {
                Authorization: PEXELS_API_KEY,
            };

            if (currentSearchTerm) {
                response = await axios.get(`https://api.pexels.com/v1/search?query=${currentSearchTerm}&page=${page}&per_page=30`, { headers });
            } else if (selectedCategory.query) {
                response = await axios.get(`https://api.pexels.com/v1/search?query=${selectedCategory.query}&page=${page}&per_page=30`, { headers });
            } else {
                response = await axios.get(`https://api.pexels.com/v1/curated?page=${page}&per_page=30`, { headers });
            }

            if (response.data.photos.length === 0) {
                setHasMore(false);
            } else {
                setImages(prevImages => (reset ? response.data.photos : [...prevImages, ...response.data.photos]));
                setPage(prevPage => prevPage + 1);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            setHasMore(false); // Stop trying to fetch if there's an error
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, selectedCategory, currentSearchTerm]);

    useEffect(() => {
        fetchImages(true); // Fetch initial images on mount or category/search change
    }, [selectedCategory, currentSearchTerm]); // Re-fetch when category or search term changes

    const lastImageElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchImages();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchImages]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setIsDialogOpen(true);
    };

    const handleDownload = async () => {
        if (selectedImage) {
            try {
                const response = await axios.get(selectedImage.download_url, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `explore_image_${selectedImage.id}.jpg`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Error downloading image:", error);
            }
        }
    };

    return (
        <div className="w-full flex justify-center bg-white dark:bg-black text-black dark:text-white min-h-screen">
            <div className="w-full max-w-5xl mx-auto px-0 sm:px-2 py-8 md:pl-60">
                <h1 className="text-2xl font-bold mb-6 text-center">Explore</h1>

                {/* Category Buttons */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {categories.map((category) => (
                        <Button
                            key={category.name}
                            variant={selectedCategory.name === category.name ? "default" : "outline"}
                            onClick={() => {
                                setSelectedCategory(category);
                                setCurrentSearchTerm(""); // Clear search when category is selected
                            }}
                            className="rounded-full"
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="flex items-center gap-2 mb-6 px-4">
                    <Input
                        type="text"
                        placeholder="Search for images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                setCurrentSearchTerm(searchQuery);
                                setSelectedCategory(categories[0]); // Reset category when searching
                            }
                        }}
                        className="flex-1 bg-gray-100 dark:bg-[#23272e] text-black dark:text-white border border-gray-200 dark:border-gray-800"
                    />
                    <Button onClick={() => {
                        setCurrentSearchTerm(searchQuery);
                        setSelectedCategory(categories[0]); // Reset category when searching
                    }}>
                        <Search className="h-5 w-5" />
                    </Button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                    {images.map((image, index) => {
                        if (images.length === index + 1) {
                            return (
                                <div ref={lastImageElementRef} key={image.id} className="relative group cursor-pointer bg-gray-100 dark:bg-gray-800 aspect-square overflow-hidden"
                                    onClick={() => handleImageClick(image)}>
                                    <img
                                        src={image.src.medium}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <div key={image.id} className="relative group cursor-pointer bg-gray-100 dark:bg-gray-800 aspect-square overflow-hidden"
                                    onClick={() => handleImageClick(image)}>
                                    <img
                                        src={image.src.medium}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            );
                        }
                    })}
                </div>
                {loading && (
                    <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                )}
                {!hasMore && !loading && images.length > 0 && (
                    <p className="text-center text-gray-500 py-4">No more images to load.</p>
                )}
                {!hasMore && !loading && images.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Could not load images.</p>
                )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
                    {selectedImage && (
                        <div className="flex flex-col items-center">
                            <img src={selectedImage.src.large} alt="Enlarged" className="max-w-full h-auto" />
                            <div className="p-4 w-full flex flex-col items-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Photo by: {selectedImage.photographer}</p>
                                <Button onClick={handleDownload} className="bg-[#0095F6] hover:bg-[#318bc7] text-white">
                                    Download
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExplorePage;
