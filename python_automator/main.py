import pymongo
import datetime
import boto3
import os
import itertools
from botocore.exceptions import NoCredentialsError
session = boto3.session.Session()

ACCESS_KEY = 'PA252WG6BPK7SJGD3QRW'
SECRET_KEY = 'YWa66a9/e86v3DBuN7fXF+cQXMtpwU8xTyLR/VICt8U'

myclient = pymongo.MongoClient("mongodb+srv://julian:qeZvQfTQPoUJ9h4V@cluster0-nd7nf.mongodb.net")

print(myclient.list_database_names())


mydb = myclient["thecoffeeangel"]
mycol = mydb["posts"]


def getTheData(imageName):

	name = imageName
	name = name.split("-")
	day = int(name[2][:2])
	month = int(name[1]) 
	year = int(name[0])
	x = datetime.datetime(year, month, day)


	# Get the #day
	d0 = datetime.datetime(2019, 5, 12)
	d1 = datetime.datetime(year,month,day)
	delta = d1- d0
	day_count = "#" + str(delta.days)

	# Set The Display Date 

	date_display = str(day) + "/" + str(month) + "/" + str(year)


	return [x,date_display,day_count]

	# # Create The Post
	# post = {"urls": ["https://fra1.digitaloceanspaces.com/instagram.jpg"], "date": x, "location": "Location Placeholder", "description": "Here will come the Description.", "date_display": date_display, "day":day}
	# # x = mycol.insert_one(post)


def upload_to_aws(local_file, bucket, s3_file):

    # s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY,
    #                   aws_secret_access_key=SECRET_KEY)
    s3_client = session.client(
	    service_name='s3',
	    aws_access_key_id=ACCESS_KEY,
	    aws_secret_access_key=SECRET_KEY,
	    endpoint_url='https://fra1.digitaloceanspaces.com',
	)
    try:
        s3_client.upload_file(local_file, bucket, "posts_optimized/"+s3_file, ExtraArgs={'ACL':'public-read'})
        print("Upload Successful")
        print("URL is " + "https://"+ bucket +".fra1.cdn.digitaloceanspaces.com/posts_optimized/" +s3_file)
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False


# uploaded = upload_to_aws('test.jpg', 'codeerolabs', 'image_test_py.jpg')


def getAllImages(dir):
	filelist=os.listdir(dir)
	for fichier in filelist[:]: # filelist[:] makes a copy of filelist.
	    if not(fichier.endswith(".jpg")):
	        filelist.remove(fichier)
	return filelist

# getAllImages("images")

# THIS IS IT


# Upload Images 

def uploadAll(imageDir,bucket):
		# Upload All Images


	allImages = getAllImages(imageDir)
	allImages.sort()

	uploaded = 0 
	to_upload = len(allImages)


	for image in allImages:
		print(image)
		upload_to_aws(imageDir + "/" + image, bucket, image)
		uploaded += 1
		print ("Uploaded " + str(uploaded) + " of " + str(to_upload))

def main_process(imageDir,bucket):

	uploadAll(imageDir, bucket)

	posts_created = 0 

	now = datetime.datetime.now()
	posts = []
	test_list = getAllImages(imageDir)
	test_list.sort() 
	res = [list(i) for j, i in itertools.groupby(test_list, 
	                  lambda a: a.split('_')[0])] 
	posts_to_create = len(res)
	for day in res:
		urls = []
		for image in day:
			urls.append("https://"+bucket+".fra1.cdn.digitaloceanspaces.com/posts_optimized/" +image)
		data = getTheData(day[0])
		date = data[0]
		date_display = data[1]
		day = data[2]
		post = {"urls": urls, "date": date, "location": "Location Placeholder", "description": "Here will come the Description.", "date_display": date_display, "day":day, "created_at": now, "updated_at": now,}
		posts.append(post)
		posts_created += 1
		print("Creating Post:")
		print(post["day"])
		print("")
		print("Creating post " + str(posts_created) + " of " + str(posts_to_create))
	# # Here we git to 
	# for image in getAllImages(imageDir):
	# 	print(image)
	# 	upload_to_aws(imageDir + "/" + image, 'codeerolabs', image)
	# 	data = getTheData(image)
	# 	urls = ["https://codeerolabs.fra1.digitaloceanspaces.com/" +image]
	# 	date = data[0]
	# 	date_display = data[1]
	# 	day = data[2]
	# 	post = {"urls": urls, "date": date, "location": "Location Placeholder", "description": "Here will come the Description.", "date_display": date_display, "day":day, "created_at": now, "updated_at": now}
	# 	posts.append(post)
	# 	print("Creating Post:")
	# 	print(post)
	up = mycol.insert_many(posts)



main_process("images_to_upload", "jenk")


# uploadAll("images_to_upload", "jenk")

def getDays():
	test_list = getAllImages('images_optimized')
	test_list.sort() 
	print ("The original list is : " + str(test_list)) 
	# using lambda + itertools.groupby() + split() 
	# group similar substrings 
	res = [list(i) for j, i in itertools.groupby(test_list, 
	                  lambda a: a.split('_')[0])] 
  
	# printing result 
	print ("The grouped list is : " + str(res)) 
	return res

# sortedd = getDays()

# for ex in sortedd:
# 	for d in ex:
# 		print("This is an image file: "  + d + '\n')
# 	print("This is the day" + str(ex[0]))
# # mylist = [
#   { "name": "Amy", "address": "Apple st 652"},
#   { "name": "Hannah", "address": "Mountain 21"},
#   { "name": "Michael", "address": "Valley 345"},
#   { "name": "Sandy", "address": "Ocean blvd 2"},
#   { "name": "Betty", "address": "Green Grass 1"},
#   { "name": "Richard", "address": "Sky st 331"},
#   { "name": "Susan", "address": "One way 98"},
#   { "name": "Vicky", "address": "Yellow Garden 2"},
#   { "name": "Ben", "address": "Park Lane 38"},
#   { "name": "William", "address": "Central st 954"},
#   { "name": "Chuck", "address": "Main Road 989"},
#   { "name": "Viola", "address": "Sideway 1633"}
# ]

# x = mycol.insert_many(mylist)

# #print list of the _id values of the inserted documents:
# print(x.inserted_ids) 
