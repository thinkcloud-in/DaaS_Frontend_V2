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
    <div>
      <div className="flex-1 overflow-auto rounded-md bg-white table-container custom-scrollbar">
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
