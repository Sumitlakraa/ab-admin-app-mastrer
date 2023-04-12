//STORE FILTER IN LOCAL STORAGE ON ALL PAGE 

export class FilterStorageUtil {

    public static removeFilter(pageKey: string, key: string) {
        sessionStorage.removeItem(pageKey + ':' + key);
    }

    public static removeAllFilters(pageKey: string, keys: string[]) {
        keys.forEach(key => {
            sessionStorage.removeItem(pageKey + ':' + key);
        });
    }

    public static saveFilter(pageKey: string, key: string, filterId: string, filterDisplayValue: string) {
        sessionStorage.setItem(pageKey + ':' + key, filterId + '|' + filterDisplayValue);
    }

    public static getAllFilters(pageKey: string, keys: string[]) {
        let maps = [];

        let filters = new Map();
        let filtersDisplayValue = new Map();

        keys.forEach(key => {
            let value = sessionStorage.getItem(pageKey + ':' + key);
            if(value != null) {
                let index = value.indexOf('|');
                filters.set(key, value.substring(0, index));
                filtersDisplayValue.set(key, value.substring(index + 1));
            }
        });

        maps[0] = filters;
        maps[1] = filtersDisplayValue;
        return maps;
    }

}