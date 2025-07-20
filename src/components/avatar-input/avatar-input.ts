import { Block } from '../../core/block';
import template from './avatar-input.hbs?raw';

interface AvatarInputProps {
    id: string;
    name: string;
    currentAvatar?: string;
    events?: {
        change: (_e: Event) => void;
    };
    [key: string]: unknown;
}

export class AvatarInput extends Block<AvatarInputProps> {
    private selectedFile: File | null = null;

    constructor(props: AvatarInputProps) {
        super({
            ...props,
            events: {
                change: (e: Event) => this.handleChange(e)
            }
        });
    }

    private handleChange(e: Event) {
        const MAX_SIZE = 1 * 1024 * 1024; // 1MB
        const input = e.target as HTMLInputElement;

        if (input.files && input.files[0]) {
            this.selectedFile = input.files[0];
            console.log("Выбран файл:", this.selectedFile);
            const file = input.files[0];

            if (file.size > MAX_SIZE) {
                alert('Файл слишком большой. Максимальный размер: 1MB');
                input.value = '';
                return;
            }

            this.selectedFile = file;
            const reader = new FileReader();

            reader.onload = (event) => {
                this.setProps({
                    currentAvatar: event.target?.result as string
                });
            };

            reader.readAsDataURL(file);
        }
    }
    public saveState() {
        return {
            file: this.selectedFile,
            avatarUrl: this.props.currentAvatar
        };
    }

    public restoreState(state: { file: File | null, avatarUrl: string }) {
        this.selectedFile = state.file;
        this.setProps({ currentAvatar: state.avatarUrl });
    }
    public getFile(): File | null {
        return this.selectedFile;
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
