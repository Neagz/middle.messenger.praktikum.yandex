class AvatarManager {
    private static instance: AvatarManager;
    private currentAvatar: string | null = null;

    private constructor() {}

    public static getInstance(): AvatarManager {
        if (!AvatarManager.instance) {
            AvatarManager.instance = new AvatarManager();
        }
        return AvatarManager.instance;
    }

    public saveAvatar(html: string): void {
        this.currentAvatar = html;
    }

    public getAvatar(): string | null {
        return this.currentAvatar;
    }

    public clear(): void {
        this.currentAvatar = null;
    }
}

export const avatarManager = AvatarManager.getInstance();
