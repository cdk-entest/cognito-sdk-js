import { Box, VStack, Button } from "@chakra-ui/react";
import { signOut } from "../services/cognito";

const SignOutForm = ({ setUser }: { setUser: any }) => {
  const signOutButton = async () => {
    const resp = await signOut();
    setUser(null);
  };
  return (
    <Box
      height="70vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      margin={"auto"}
    >
      <VStack
        py={12}
        px={12}
        borderWidth={1}
        borderRadius="lg"
        spacing={4}
        alignItems="flex-start"
      >
        <Button
          width="100%"
          colorScheme="teal"
          onClick={async () => {
            signOutButton();
          }}
        >
          Sign Out
        </Button>
      </VStack>
    </Box>
  );
};

export default SignOutForm;
