import React, { useState, useEffect } from "react";
import { selectAuthToken } from '../../redux/features/Auth/AuthSelectors';
import { useDispatch, useSelector } from "react-redux";
import { fetchPools } from "../../redux/features/Pools/PoolsThunks";
import { selectIsPoolAvailable } from "../../redux/features/Pools/PoolsSelectors";
import CreateNewPool from "./CreateNewPool";
import ShowPools from "./ShowPools";
import ShowPoolsSkeleton from "./ShowPoolsSkeleton";
import "./css/Pools.css";

const Pools = () => {
  const token = useSelector(selectAuthToken);
  const dispatch = useDispatch();
  const isPoolAvailable = useSelector(selectIsPoolAvailable);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      // no token yet; stop loading until token is available
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // dispatch thunk and update local loading state when done
    dispatch(fetchPools(token))
      .unwrap()
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token, dispatch]);

  return (
    <div className="pools-wrapper flex flex-col h-[90vh]  min-h-[75vh] w-[98%] m-auto mt-4 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-y-auto">
        {isLoading ? (
          <ShowPoolsSkeleton />
        ) : isPoolAvailable ? (
          <ShowPools />
        ) : (
          <CreateNewPool />
        )}
      </div>
    </div>
  );
};

export default Pools;
