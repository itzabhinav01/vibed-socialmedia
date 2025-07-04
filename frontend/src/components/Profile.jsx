import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');

  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10 bg-white dark:bg-black text-black dark:text-white'>
      <div className='flex flex-col gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback className="text-black dark:text-white bg-gray-100 dark:bg-[#374151]">CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span className="text-black dark:text-white">{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8 bg-gray-100 dark:bg-[#23272e] text-black dark:text-white'>Edit profile</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8 bg-gray-100 dark:bg-[#23272e] text-black dark:text-white'>View archive</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8 bg-gray-100 dark:bg-[#23272e] text-black dark:text-white'>Ad tools</Button>
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button variant='secondary' className='h-8 bg-gray-100 dark:bg-[#23272e] text-black dark:text-white'>Unfollow</Button>
                        <Button variant='secondary' className='h-8 bg-gray-100 dark:bg-[#23272e] text-black dark:text-white'>Message</Button>
                      </>
                    ) : (
                      <Button className='bg-[#0095F6] hover:bg-[#3192d2] h-8 text-white'>Follow</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold text-black dark:text-white'>{userProfile?.posts.length} </span>posts</p>
                <p><span className='font-semibold text-black dark:text-white'>{userProfile?.followers.length} </span>followers</p>
                <p><span className='font-semibold text-black dark:text-white'>{userProfile?.following.length} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold text-black dark:text-white'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit bg-gray-100 dark:bg-[#23272e] text-black dark:text-white' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
                {
                  userProfile?.highlights?.map((highlight, index) => (
                    <span key={index} className="text-black dark:text-white">{highlight}</span>
                  ))
                }
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200 dark:border-t-gray-800'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''} text-black dark:text-white`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''} text-black dark:text-white`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className='py-3 cursor-pointer text-black dark:text-white'>REELS</span>
            <span className='py-3 cursor-pointer text-black dark:text-white'>TAGS</span>
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {
              displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer'>
                    <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <div className='flex items-center text-white space-x-4'>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile