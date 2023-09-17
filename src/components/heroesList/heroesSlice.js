import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { useHttp } from "../../hooks/http.hook";

const heroesAdapter = createEntityAdapter();

// const initialState = {
//     heroes: [],
//     heroesLoadingStatus: 'idle'
// }

// Получение начального состояния из адаптера
const initialState = heroesAdapter.getInitialState({
    heroesLoadingStatus: 'idle'
})

// Возвращается 3 action (состояния promise):
// pending
// fulfilled
// rejected
export const fetchHeroes = createAsyncThunk(
    'heroes/fetchHeroes', // создаём тип действия
    () => {
        const {request} = useHttp(); // Нужно убрать useCallback, потому что мемоизированные функции работать не будут
        return request("http://localhost:3001/heroes"); // async await уже есть в useHttp
    }
);

// Объединяет в себя createAction и createReducer
// Применяются 4 аргумента:
// 1) Пространство имён (название нашего среза, будут генерироваться разные сущности, не должно быть пересечений (state.heroes));
// 2) Начальное состояние
// 3) Объект с reducer'ами, мы получаем сразу actions и reducer (слева actionCreaters, справа действия, которые мы подвязываем)
// Так как fetchHeroes - внешний actionCreator, то записать их нужно в extrareducers
// Данные от promise fetchHeroes перейдут в action.payload
const heroesSlice = createSlice({
    name: 'heroes',
    initialState,
    reducers: {
        // heroesFetching: state => {state.heroesLoadingStatus = 'loading'},
        // heroesFetched: (state, action) => {
        //     state.heroesLoadingStatus = 'idle';
        //     state.heroes = action.payload;
        // },
        // heroesFetchingError: state => {
        //     state.heroesLoadingStatus = 'error';
        // },
        heroCreated: (state, action) => {
            // state.heroes.push(action.payload);
            heroesAdapter.addOne(state, action.payload);
        },
        heroDeleted: (state, action) => {
            // state.heroes = state.heroes.filter(item => item.id !== action.payload);
            heroesAdapter.removeOne(state, action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHeroes.pending, state => {state.heroesLoadingStatus = 'loading'})
            .addCase(fetchHeroes.fulfilled, (state, action) => {
                state.heroesLoadingStatus = 'idle';
                heroesAdapter.setAll(state, action.payload);
            })
            .addCase(fetchHeroes.rejected, state => {state.heroesLoadingStatus = 'error';})
            .addDefaultCase(() => {})
    }
});

// Возвращает name, actions, reducer
const {actions, reducer} = heroesSlice;

export default reducer;

const {selectAll} = heroesAdapter.getSelectors(state => state.heroes);

// Получение функции селектор (функции, которые получают кусочек нашего state)
// Более оптимизированный (не будет срабатывать, если приходит один и тот же state)
export const filteredHeroesSelector = createSelector(
    (state) => state.filters.activeFilter,
    selectAll,
    (filter, heroes) => {
        if (filter === 'all') {
            return heroes;
        } else {
            return heroes.filter(item => item.element === filter)
        }
    }
);

export const {
    heroesFetching,
    heroesFetched,
    heroesFetchingError,
    heroCreated,
    heroDeleted
} = actions;