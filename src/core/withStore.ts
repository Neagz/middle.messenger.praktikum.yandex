import { Block } from '../core/block';
import { store } from '../core/store';

export function withStore<P extends Record<string, unknown>>(
    WrappedBlock: new (_props: P) => Block<P>,
    mapStateToProps: (_state: typeof store extends { getState(): infer S } ? S : never) => Partial<P>
) {
    return class extends WrappedBlock {
        private onChangeStoreCallback: () => void;

        constructor(props: P) {
            const _state = store.getState();
            const mappedProps = mapStateToProps(_state);

            super({ ...props, ...mappedProps });

            this.onChangeStoreCallback = () => {
                const newState = store.getState();
                const newMappedProps = mapStateToProps(newState);
                this.setProps(newMappedProps);
            };

            store.on('changed', this.onChangeStoreCallback);
        }
    };
}
