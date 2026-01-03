export const useCometChatUserCreation = () => {
    const createUser = async ({ email, name, role }: { email: string; name: string; role: string }) => {
        console.log('Mock create user:', { email, name, role });
        return true;
    };

    return { createUser };
};
