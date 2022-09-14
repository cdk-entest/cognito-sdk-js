import { Image, Box, Text, Flex, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { listObjects, getS3Object } from "../services/cognito"


const ListImages = ({
  user,
  images,
  setImageUrl,
}: {
  user: any,
  images: string[];
  setImageUrl: any;
}) => {
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      height={"300px"}
      overflowY={"auto"}
      marginTop={"20px"}
    >
      {images.map((image, id) => (
        <Flex
          key={id}
          width={"100%"}
          justifyContent={"space-between"}
          padding={"5px"}
          backgroundColor={"gray.100"}
          marginBottom={"5px"}
        >
          <Text>{image}</Text>
          <Button
            colorScheme={"teal"}
            onClick={async () => {
              const url = await getS3Object(user['AuthenticationResult']['IdToken'], image);
              setImageUrl(url);
            }}
          >
            Download
          </Button>
        </Flex>
      ))}
    </Flex>
  );
};


const ViewImage = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <Box
      bg={"gray.100"}
      width={"1000px"}
      height={"500px"}
      padding={"20px"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      marginBottom={"20px"}
    >
      {imageUrl && <Image src={imageUrl} width="auto" height={"350px"}></Image>}
    </Box>
  );
};


export const Profile = ({ user }: { user: any }) => {

  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string>()

  const getImages = async () => {
    const items = await listObjects(user["AuthenticationResult"]['IdToken'])

    if (items) {
      const keys = items.map(item => item["Key"]!)
      setImages(keys)
    }
  }

  useEffect(() => {
    getImages()
  }, [])

  return (
    <Flex
      margin={'auto'}
      maxW={"1000px"}
      direction={'column'}
      alignItems={'center'}
    >
      <ViewImage imageUrl={imageUrl!}></ViewImage>
      <ListImages user={user} images={images} setImageUrl={setImageUrl}></ListImages>
    </Flex>
  )
}
