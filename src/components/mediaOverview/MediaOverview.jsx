import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useMedia from "@/hooks/useMedia";
import { Button } from "@/components/ui/button";
import { renderStars } from "@/assets/renderStar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "../ui/card";
import MediaOverviewSkeleton from "./MediaOverviewSkeleton";
import { auth } from '@/config/firebase'; // Import Firebase authentication

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // Base URL for TMDb images

function MediaOverview() {
  const { mediatype, id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const { media, cast, videos, loading, error } = useMedia(id, mediatype);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  if (loading) return <MediaOverviewSkeleton />;
  if (error) return <p>Error: {error.message}</p>;

  const trailer = videos.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );
  const trailerUrl = trailer
    ? `https://www.youtube.com/watch?v=${trailer.key}`
    : null;

  const handleWatchNowClick = () => {
    if (!user) {
      navigate('/login'); // Redirect to login page if user is not logged in
    } else if (trailerUrl) {
      window.open(trailerUrl, "_blank");
    }
  };

  return (
    <>
      <div
        className={`flex flex-col md:flex-row w-full max-w-5xl m-auto p-5 shadow-gray-300 shadow-lg rounded`}
      >
        {media && (
          <>
            <div className="w-full md:w-1/2 lg:w-1/3">
              <img
                src={`${IMAGE_BASE_URL}${media.poster_path}`}
                alt={media.title || media.name}
                className="object-contain w-full h-auto rounded shadow-gray-600 shadow-lg"
              />
            </div>

            <div className="mt-10 md:mt-0 md:ml-10 w-full md:w-1/2 lg:w-2/3 text-center">
              <h1 className="text-3xl font-bold mb-4">
                {media.title || media.name}
              </h1>
              <hr />
              <p className="lg:text-md mb-4 lg:p-10 pt-5 text-justify">
                {media.overview}
              </p>

              <div className="lg:flex lg:items-center lg:justify-center lg:mt-5">
                {media.genres.map((genre) => (
                  <Button
                    key={genre.id} // Add a unique key prop
                    variant="outline"
                    size="sm"
                    className="mx-2 mt-5 border-none shadow-green-300 rounded shadow-md"
                  >
                    {genre.name}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col lg:p-10 md:flex-row lg:justify-between lg:items-center mt-5">
                <div>
                  <p className="text-sm font-semibold mb-2 md:mb-0 text-start">
                    Release Date:{" "}
                    <span className="text-gray-400 ml-2">
                      {mediatype === "movie"
                        ? media.release_date
                        : media.first_air_date}
                    </span>
                  </p>
                  <div className="flex items-center text-sm font-semibold">
                    Rating:{" "}
                    <span className="flex text-gray-400 ml-2">
                      {renderStars(media.vote_average)}
                    </span>
                  </div>
                </div>
                <div className="lg:mx-3 md:mx-3">
                  <p className=" text-sm font-semibold mb-2 md:mb-0 text-start">
                    Status:{" "}
                    <span className="text-gray-400">{media.status}</span>
                  </p>
                  <p className=" text-sm font-semibold mb-2 md:mb-0 text-start">
                    Popularity:{" "}
                    <span className="text-gray-400">{media.popularity}</span>
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  onClick={handleWatchNowClick}
                  variant="outline"
                  className="w-full"
                >
                  Watch Now
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="w-[70%] m-auto">
        <h2 className="text-2xl font-bold mb-3 mt-5 underline">Cast</h2>
        {cast && cast.length > 0 && (
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {cast.map((actor) => (
                <CarouselItem
                  key={actor.cast_id || actor.id} // Ensure a unique key prop
                  className="pl-1 md:basis-1/3 lg:basis-1/4 basis-1/1"
                >
                  <div className="p-1">
                    <Card className="rounded-xl shadow-yellow-200 shadow-md border-none">
                      <CardContent className="flex items-center justify-center p-2">
                        <div>
                          <img
                            src={`${IMAGE_BASE_URL}${actor.profile_path}`}
                            alt={actor.name}
                            className="w-[13rem] h-[13rem] rounded-full shadow-lg mb-2"
                          />
                          <p className="text-md font-semibold text-center">
                            {actor.name}
                          </p>
                          <p className="text-sm text-gray-400 text-center">
                            {actor.character}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>
    </>
  );
}

export default MediaOverview;
