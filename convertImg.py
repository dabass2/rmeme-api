import PIL.Image
import uuid
import sys
import os

def toJpg(image):
    im = PIL.Image.open(image)
    if im.mode != "RGB":
        im = im.convert('RGB')
    name = uuid.uuid4().hex
    print(name)
    sys.stdout.flush()
    im.save("../../rmeme/html/images/memes/{}.jpg".format(name))

def main():
    #print(sys.argv[1])
    image = sys.argv[1]
    #print(image)
    toJpg(image)
    os.remove(image)

main()
