import { Block } from '../core/block';
import { store } from '../core/store';

interface AppState {
}

export function withStore<P extends Record<string, unknown>>(WrappedBlock: new (props: P) => Block<P>, mapStateToProps: (state: AppState) => Partial<P>) {
    return class extends WrappedBlock {
        private onChangeStoreCallback: () => void;

        constructor(props: P) {
            const state = store.getState();
            const mappedProps = mapStateToProps(state);

            super({ ...props, ...mappedProps, ...mapStateToProps(store.getState()) });

            this.onChangeStoreCallback = () => {
                const newState = store.getState();
                const newMappedProps = mapStateToProps(newState);
                this.setProps(newMappedProps);
            };

            store.on('changed', this.onChangeStoreCallback);
        }
    };
}
