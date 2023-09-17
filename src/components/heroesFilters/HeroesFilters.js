import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";

import store from "../../store";
import { activeFilterChanged, fetchFilters, selectAll } from "./filtersSlice";
import Spinner from "../spinner/Spinner";

const HeroesFilters = () => {

    const {filtersLoadingStatus, activeFilter} = useSelector(state => state.filters);
    const filters = selectAll(store.getState());
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFilters());
        // eslint-disable-next-line
    }, []);

    if (filtersLoadingStatus === 'loading') {
        return <Spinner/>
    } else if (filtersLoadingStatus === 'error') {
        return <h5>Произошла ошибка...</h5>
    }

    const renderFilters = (arr) => {
        if (arr.length === 0) {
            <h5>Фильтров пока нет...</h5>
        }

        const items = arr.map(({name, label, className}) => {
            return (
                <button
                key={name}
                id={name}
                className={classNames('btn', className, {
                    'active': name === activeFilter
                })}
                onClick={() => dispatch(activeFilterChanged(name))}
                >
                {label}
                </button>
            );
        });

        return items;
    }

    const elements = renderFilters(filters);

    return (
        <div className="card shadow-lg mt-4">
            <div className="card-body">
                <p className="card-text">Отфильтруйте героев по элементам</p>
                <div className="btn-group">
                    {elements}
                </div>
            </div>
        </div>
    )
}

export default HeroesFilters;